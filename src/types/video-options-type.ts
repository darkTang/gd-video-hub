export interface VideoOptionsType {
    src: string;
    height?: number;
    poster?: string;
    isShowControls?: boolean;
    isShowTitle?: boolean;
    isAutoplay?: boolean;
    isMute?: boolean;
    isLoop?: boolean;
}

export interface ProgressType {
    handleProgressClick(progressContainer: HTMLDivElement, e: MouseEvent): number;
    handleProgressDrag(progressContainer: HTMLDivElement, e: MouseEvent): number;
}
