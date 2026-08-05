/**
 * @module ChatsFeature
 * @description Barrel de re-exportación del módulo ChatsFeature.
 * Orquestador principal con NavigationState centralizado y
 * componentes taxonómicos N1–N4.
 *
 * Taxonomía N2:
 *   [Panel]   → ChatN2ListPanel
 *   [Header]  → ChatN2Header
 *   [Control] → ControlFilterRrss
 *   [List]    → ChatN2List
 *   [Detail]  → ChatN2FeedCard, PostFeedCard
 *   [UI]      → ChatN2Skeleton
 */
export { ChatsFeature } from "./ChatsFeature";
export type { ChatsFeatureProps } from "./ChatsFeature";
export { ChatN2Header } from "./ChatN2Header";
export { ControlFilterRrss } from "./ControlFilterRrss";
export type { ControlFilterRrssProps } from "./ControlFilterRrss";
export { ChatN2ListPanel } from "./ChatN2ListPanel";
export type { ChatN2ListPanelProps } from "./ChatN2ListPanel";
export { ChatN2List } from "./ChatN2List";
export type { ChatN2ListProps } from "./ChatN2List";
export { ChatN2FeedCard } from "./ChatN2FeedCard";
export type { ChatN2FeedCardProps } from "./ChatN2FeedCard";
export { PostFeedCard } from "./PostFeedCard";
export type { PostFeedCardProps } from "./PostFeedCard";
export { ChatN2Skeleton } from "./ChatN2Skeleton";
export { FeedPanelNinja } from "./FeedPanelNinja";
export type { FeedPanelNinjaProps, TrendItem } from "./FeedPanelNinja";
export { FeedNinjaDetail } from "./FeedNinjaDetail";
export type { FeedNinjaDetailProps } from "./FeedNinjaDetail";
export { ChatN3DetailPanel } from "./ChatN3DetailPanel";
export type { ChatN3DetailPanelProps } from "./ChatN3DetailPanel";
export { ChatN3MessagesFeed } from "./ChatN3MessagesFeed";
export { ChatN3Header } from "./ChatN3Header";
export type { ChatN3HeaderProps } from "./ChatN3Header";
export { ChatN4SubDetailPanel } from "./ChatN4SubDetailPanel";
export type { ChatN4SubDetailPanelProps } from "./ChatN4SubDetailPanel";
export { ChatN4NoteForm } from "./ChatN4NoteForm";
export type { ChatN4NoteFormProps } from "./ChatN4NoteForm";
export { ChatN4NotesHistory } from "./ChatN4NotesHistory";
export type { ChatN4NotesHistoryProps } from "./ChatN4NotesHistory";
export { ChatN4Header } from "./ChatN4Header";
export type { ChatN4HeaderProps, ChatN4HeaderSize } from "./ChatN4Header";
export { ControlChat } from "./ControlChat";
export type { ControlChatProps } from "./ControlChat";
export type { SocialPost } from "./types";