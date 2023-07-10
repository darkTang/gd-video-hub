import { ProgressType } from "../types/video-options-type";
const progress: ProgressType = {
  handleProgressClick: (progressContainer: HTMLDivElement, e: MouseEvent) => {
    let progressContainerWidth: number = progressContainer.offsetWidth;
    let x: number = e.offsetX;
    let value = (x * 100) / progressContainerWidth;
    if (value > 100) {
      value = 100;
    }
    if (value < 0) {
      value = 0;
    }
    return value;
  },
  handleProgressDrag: (progressContainer: HTMLDivElement, e: MouseEvent) => {
    const DOMRect = progressContainer.getBoundingClientRect();
    let left: number = DOMRect.left;
    let width: number = DOMRect.width;
    let value = ((e.clientX - left) * 100) / width;
    if (value > 100) {
      value = 100;
    }
    if (value < 0) {
      value = 0;
    }
    return value;
  },
};

export default progress;
