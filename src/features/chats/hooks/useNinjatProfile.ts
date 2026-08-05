/**
 * @module useNinjatProfile
 * @description Hook puro de captura de handles de usuario, carga de perfiles,
 * consulta de publicaciones históricas y catálogo de productos por creador
 * (Perfil Ninjat público — Club Privado /@handle).
 *
 * Encapsula la lógica que vivía en el orquestador ChatsFeature:
 *   - Detección del handle desde la URL (useParams<{ handle?: string }>).
 *   - Limpieza defensiva del prefijo @ (ej. @pedrito → pedrito).
 *   - Carga del perfil del creador vía getProfileByHandle (supabaseService).
 *   - Consulta de publicaciones históricas vía postService.fetchPostsByUser.
 *   - Consulta del catálogo de productos vía productService.fetchProductsByUser.
 *   - Reseteo a defaults cuando no hay handle en la URL.
 *
 * Carga en paralelo (Promise.all): tras resolver el perfil, se disparan de
 * forma concurrente el feed de posts y el catálogo de productos — cero esperas
 * secuenciales que bloqueen la UI.
 *
 * Estados internos:
 *   - ninjatProfile:    NinjatProfile | null — perfil del creador recuperado.
 *   - ninjatPosts:      SocialPost[] — publicaciones históricas del creador.
 *   - ninjatProducts:   ProductCardProduct[] — catálogo real de la tabla products.
 *   - isLoadingNinjat:  boolean — estado de carga global de la identidad.
 *   - error:            string | null — mensaje de error si el handle no
 *                        existe o falla la red (no bloqueante).
 *
 * Stats reactivas (useMemo) para alimentar los contadores del header:
 *   - totalNinjats: longitud de ninjatPosts.
 *   - totalLikes:   suma acumulada de post.metrics?.likes.
 *   - totalShares:  suma acumulada de post.metrics?.shares.
 *
 * Tipos: importados desde `src/features/chats/types/profile.ts` (módulo
 * independiente) — rompe la dependencia circular con ProfileN3DetailPanel.
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { SocialPost } from '../types';
import type { NinjatProfile, NinjatProfileStats } from '../types/profile';
import type { ProductCardProduct } from '../../../components/ui/ProductCard';
import { getProfileByHandle } from '../../../services/supabase';
import { fetchPostsByUser } from '../../../services/postService';
import { fetchProductsByUser } from '../../../services/productService';

/**
 * Hook puro del perfil Ninjat público.
 * Detecta el handle de la URL (/@handle) y carga el perfil del creador
 * junto con su histórico de publicaciones y su catálogo de productos.
 */
export function useNinjatProfile() {
  // ── Detección de Handle desde la URL ──
  const { handle } = useParams<{ handle?: string }>();

  // ── Estados internos ──
  const [ninjatProfile, setNinjatProfile] = useState<NinjatProfile | null>(null);
  const [ninjatPosts, setNinjatPosts] = useState<SocialPost[]>([]);
  const [ninjatProducts, setNinjatProducts] = useState<ProductCardProduct[]>([]);
  const [isLoadingNinjat, setIsLoadingNinjat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Efecto de Carga (reacciona al cambio del handle en la URL) ──
  useEffect(() => {
    // Si no hay handle en la URL → limpiar todos los estados a sus defaults
    if (!handle) {
      setNinjatProfile(null);
      setNinjatPosts([]);
      setNinjatProducts([]);
      setIsLoadingNinjat(false);
      setError(null);
      return;
    }

    let mounted = true;

    // Limpieza defensiva del prefijo @ (ej. @pedrito → pedrito)
    const cleanHandle = handle.replace(/^@/, '');

    setIsLoadingNinjat(true);
    setError(null);

    getProfileByHandle(cleanHandle)
      .then((profile) => {
        if (!mounted) return;

        if (profile) {
          // Perfil existe → guardarlo y consultar en PARALELO su histórico de
          // Ninjats y su catálogo de productos real (tabla products).
          setNinjatProfile(profile);

          // Sincroniza la carga en paralelo del feed de posts y el catálogo
          // utilizando Promise.all (se dispara tras resolver el perfil).
          const profileId = profile.id;

          return Promise.all([
            fetchPostsByUser(profileId),
            fetchProductsByUser(profileId),
          ]).then(([posts, products]) => {
            if (mounted) {
              setNinjatPosts(posts);
              setNinjatProducts(products);
            }
          });
        }

        // Perfil NO existe → error no bloqueante + limpiar estado
        setNinjatProfile(null);
        setNinjatPosts([]);
        setNinjatProducts([]);
        setError(`No se encontró el perfil @${cleanHandle}`);
      })
      .catch((err) => {
        console.error('[useNinjatProfile] Error cargando perfil Ninjat:', err);
        if (mounted) {
          setNinjatProfile(null);
          setNinjatPosts([]);
          setNinjatProducts([]);
          setError(
            err instanceof Error
              ? err.message
              : 'Error de conexión al cargar el perfil'
          );
        }
      })
      .finally(() => {
        if (mounted) setIsLoadingNinjat(false);
      });

    return () => {
      mounted = false;
    };
  }, [handle]);

  // ── Stats reactivas (alimentan los contadores del header del perfil) ──
  const stats = useMemo<NinjatProfileStats>(
    () => ({
      totalNinjats: ninjatPosts.length,
      totalLikes: ninjatPosts.reduce((sum, post) => sum + (post.metrics?.likes || 0), 0),
      totalShares: ninjatPosts.reduce((sum, post) => sum + (post.metrics?.shares || 0), 0),
    }),
    [ninjatPosts]
  );

  return {
    /** Perfil del creador recuperado (null si no hay handle o no existe) */
    ninjatProfile,
    /** Publicaciones históricas del creador */
    ninjatPosts,
    /** Catálogo de productos reales del creador (tabla products) */
    ninjatProducts,
    /** Estado de carga global de la identidad */
    isLoadingNinjat,
    /** Mensaje de error no bloqueante (handle inexistente o fallo de red) */
    error,
    /** Estadísticas reactivas del perfil */
    stats,
  };
}

export default useNinjatProfile;