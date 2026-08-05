/**
 * @module useNinjatProfile
 * @description Hook puro de captura de handles de usuario, carga de perfiles
 * y consulta de publicaciones históricas por creador (Perfil Ninjat público
 * — Club Privado /@handle).
 *
 * Encapsula la lógica que vivía en el orquestador ChatsFeature:
 *   - Detección del handle desde la URL (useParams<{ handle?: string }>).
 *   - Limpieza defensiva del prefijo @ (ej. @pedrito → pedrito).
 *   - Carga del perfil del creador vía getProfileByHandle (supabaseService).
 *   - Consulta de publicaciones históricas vía postService.fetchPostsByUser.
 *   - Reseteo a defaults cuando no hay handle en la URL.
 *
 * Estados internos:
 *   - ninjatProfile:   NinjatProfile | null — perfil del creador recuperado.
 *   - ninjatPosts:     SocialPost[] — publicaciones históricas del creador.
 *   - isLoadingNinjat: boolean — estado de carga global de la identidad.
 *   - error:           string | null — mensaje de error si el handle no
 *                        existe o falla la red (no bloqueante).
 *
 * Stats reactivas (useMemo) para alimentar los contadores del header:
 *   - totalNinjats: longitud de ninjatPosts.
 *   - totalLikes:   suma acumulada de post.metrics?.likes.
 *   - totalShares:  suma acumulada de post.metrics?.shares.
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { SocialPost } from '../types';
import type { NinjatProfile } from '../ProfileN3DetailPanel';
import { getProfileByHandle } from '../../../services/supabase';
import { fetchPostsByUser } from '../../../services/postService';

// ──────────────────────────────────────────────
// Tipos públicos del hook
// ──────────────────────────────────────────────

/** Estadísticas reactivas del perfil del creador para alimentar el header */
export interface NinjatProfileStats {
  /** Longitud del histórico de posts del creador */
  totalNinjats: number;
  /** Suma acumulada de likes de todos sus posts */
  totalLikes: number;
  /** Suma acumulada de shares de todos sus posts */
  totalShares: number;
}

/**
 * Hook puro del perfil Ninjat público.
 * Detecta el handle de la URL (/@handle) y carga el perfil del creador
 * junto con su histórico de publicaciones.
 */
export function useNinjatProfile() {
  // ── Detección de Handle desde la URL ──
  const { handle } = useParams<{ handle?: string }>();

  // ── Estados internos ──
  const [ninjatProfile, setNinjatProfile] = useState<NinjatProfile | null>(null);
  const [ninjatPosts, setNinjatPosts] = useState<SocialPost[]>([]);
  const [isLoadingNinjat, setIsLoadingNinjat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Efecto de Carga (reacciona al cambio del handle en la URL) ──
  useEffect(() => {
    // Si no hay handle en la URL → limpiar todos los estados a sus defaults
    if (!handle) {
      setNinjatProfile(null);
      setNinjatPosts([]);
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
          // Perfil existe → guardarlo y consultar su histórico de Ninjats
          setNinjatProfile(profile);
          return fetchPostsByUser(profile.id).then((posts) => {
            if (mounted) setNinjatPosts(posts);
          });
        }

        // Perfil NO existe → error no bloqueante + limpiar estado
        setNinjatProfile(null);
        setNinjatPosts([]);
        setError(`No se encontró el perfil @${cleanHandle}`);
      })
      .catch((err) => {
        console.error('[useNinjatProfile] Error cargando perfil Ninjat:', err);
        if (mounted) {
          setNinjatProfile(null);
          setNinjatPosts([]);
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
    /** Estado de carga global de la identidad */
    isLoadingNinjat,
    /** Mensaje de error no bloqueante (handle inexistente o fallo de red) */
    error,
    /** Estadísticas reactivas del perfil */
    stats,
  };
}

export default useNinjatProfile;