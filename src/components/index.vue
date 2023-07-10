<template>
    <div
        class="gd-video-hub-container"
        @mousemove="handleMouseMove"
    >
        <div
            class="gd-video-hub-title"
            :style="{ opacity: isActive ? 1 : 0 }"
            v-show="videoConfigs.isShowTitle"
        >
            <video-two
                theme="outline"
                size="18"
                fill="#fff"
                style="margin: 4px 3px 0;"
            />
            <span class="title">{{ title }}</span>
        </div>
        <div class="gd-video-hub-content">
            <div class="wrapper">
                <video
                    class="wrapper-video"
                    ref="video"
                    :autoplay="videoConfigs.isAutoplay"
                    :muted="videoConfigs.isMute"
                    :loop="videoConfigs.isLoop"
                    :src="videoConfigs.src"
                    :style="{ height: videoConfigs.height + 'px' }"
                    @loadeddata="handleLoadedData"
                    @progress="handleLoadProgress"
                    @timeupdate="handleTimeUpdate"
                    @ended="handlePlayEnd"
                    @error="handleError"
                >
                </video>
            </div>
            <div
                class="poster"
                v-show="videoConfigs.poster"
                :style="{ backgroundImage: `url(${videoConfigs.poster})` }"
            ></div>
            <div
                class="controls-container"
                :style="{ opacity: isActive ? 1 : 0 }"
                v-show="videoConfigs.isShowControls"
            >
                <div class="controls">
                    <div class="volume-container">
                        <volume-mute
                            v-if="volumeProgressWidth <= 0"
                            theme="outline"
                            size="20"
                            fill="#fff"
                        />
                        <volume-small
                            v-else-if="volumeProgressWidth <= 40"
                            theme="outline"
                            size="20"
                            fill="#fff"
                        />
                        <volume-notice
                            v-else
                            theme="outline"
                            size="20"
                            fill="#fff"
                        />
                        <div
                            class="volume-progress-container"
                            ref="volumeProgressContainer"
                            @click="handleProgressClick('volume', $event)"
                        >
                            <div
                                class="volume-progress"
                                :style="{ width: volumeProgressWidth.toFixed(2) + '%' }"
                            >
                                <span
                                    class="volume-bar"
                                    @click.stop
                                    @mousedown="handleProgressMouseDown('volume', $event)"
                                    @mouseup="handleProgressMouseUp('volume', $event)"
                                ></span>
                            </div>
                        </div>
                    </div>
                    <div class="play-container">
                        <go-start
                            theme="outline"
                            size="24"
                            fill="#fff"
                        />
                        <pause
                            v-show="videoAttrs.playState"
                            theme="outline"
                            size="24"
                            fill="#fff"
                            @click="handlePlay('pause')"
                        />
                        <play-one
                            v-show="!videoAttrs.playState"
                            theme="outline"
                            size="24"
                            fill="#fff"
                            @click="handlePlay('play')"
                        />
                        <go-end
                            theme="outline"
                            size="24"
                            fill="#fff"
                        />
                    </div>
                    <div class="setting-container">
                        <setting-two
                            theme="outline"
                            size="20"
                            fill="#fff"
                        />
                        <music-list
                            theme="outline"
                            size="20"
                            fill="#fff"
                        />
                    </div>
                </div>
                <div class="progress-wrapper">
                    <span class="time current-time">{{ currentFormatTime }}</span>
                    <div
                        class="progress-container"
                        ref="progressContainer"
                        @click="handleProgressClick('progress', $event)"
                    >
                        <div
                            class="progress"
                            :style="{ width: progressWidth.toFixed(2) + '%' }"
                        >
                            <span
                                class="progress-bar"
                                @click.stop
                                @mousedown="handleProgressMouseDown('progress', $event)"
                                @mouseup="handleProgressMouseUp('progress', $event)"
                            ></span>
                        </div>
                        <div
                            class="load-progress"
                            :style="{ width: loadProgressWidth.toFixed(2) + '%' }"
                        ></div>
                    </div>
                    <span class="time total-time">{{ totalTime }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType, computed, reactive, ref, watch } from 'vue';
import { VideoOptionsType, ProgressType } from '../types/video-options-type';
import { VolumeMute, VolumeSmall, VolumeNotice, GoStart, GoEnd, Pause, PlayOne, SettingTwo, MusicList, VideoTwo } from '@icon-park/vue-next'
import progress from '../utils/progress'
const props = defineProps({
    videoOptions: {
        type: Object as PropType<VideoOptionsType>,
        required: true
    }
})

const videoConfigs = reactive<VideoOptionsType>({
    src: '',
    poster: '',
    height: 400,
    isAutoplay: false,
    isMute: false,
    isLoop: false,
    isShowControls: true,
    isShowTitle: true
})

Object.assign(videoConfigs, props.videoOptions)

let progressWidth = ref<number>(0)
let volumeProgressWidth = ref<number>(30)
let loadProgressWidth = ref<number>(0)
let isActive = ref<boolean>(false)
const timer = ref<NodeJS.Timeout | null>(null)
const progressContainer = ref<HTMLDivElement>()
const volumeProgressContainer = ref<HTMLDivElement>()
const video = ref<HTMLVideoElement>()
const videoAttrs = reactive({
    playState: false,
    duration: 0,
    currentTime: 0
})

let title = computed<string>(() => {
    let url: URL
    if (props.videoOptions.src.startsWith('http')) {
        url = new URL(props.videoOptions.src)
    } else {
        url = new URL(props.videoOptions.src, 'http://localhost')
    }
    const urlArr = url.pathname.split('/')
    return urlArr[urlArr.length - 1]
})

let totalTime = computed<string>(() => {
    return formatTime(videoAttrs.duration)
})

let currentFormatTime = computed<string>(() => {
    return formatTime(videoAttrs.currentTime)
})

const emit = defineEmits<{
    (e: 'on-play', video: HTMLVideoElement): void
    (e: 'on-error', error: MediaError): void
}>()


watch(isActive, (newVal) => {
    if (newVal) {
        setTimeout(() => {
            isActive.value = false
        }, 3000);
    }
})

const formatTime = (time: number): string => {
    let t = new Date(time * 1000)
    let mm: number | string = t.getMinutes()
    mm = mm > 9 ? mm : '0' + mm
    let ss: number | string = t.getSeconds()
    ss = ss > 9 ? ss : '0' + ss
    return mm + ':' + ss
}

const handleMouseMove = () => {
    isActive.value = true
    timer.value && clearTimeout(timer.value)
}

const handleProgressClick = (flag: string, e: MouseEvent) => {
    if (flag === 'volume') {
        volumeProgressWidth.value = (progress as ProgressType).handleProgressClick(volumeProgressContainer.value!, e)
        video.value!.volume = volumeProgressWidth.value / 100
    } else if (flag === 'progress') {
        progressWidth.value = (progress as ProgressType).handleProgressClick(progressContainer.value!, e)
        video.value!.currentTime = progressWidth.value * videoAttrs.duration / 100
    }
}

const handleProgressMouseDown = (flag: string, e: MouseEvent) => {
    document.addEventListener('mousemove', () => handleProgressDrag(flag, e))
}

const handleProgressDrag = (flag: string, e: MouseEvent) => {
    if (flag === 'volume') {
        volumeProgressWidth.value = (progress as ProgressType).handleProgressDrag(volumeProgressContainer.value!, e)
        video.value!.volume = volumeProgressWidth.value / 100
    } else if ('progress') {
        progressWidth.value = (progress as ProgressType).handleProgressDrag(progressContainer.value!, e)
        video.value!.currentTime = progressWidth.value * videoAttrs.duration / 100
    }
}

const handleProgressMouseUp = (flag: string, e: MouseEvent) => {
    document.removeEventListener('mousemove', () => handleProgressDrag(flag, e))
}

const handlePlay = (flag: string) => {
    if (flag === 'play') {
        videoAttrs.playState = true
        video.value!.play()
        videoConfigs.poster = ''
    } else {
        videoAttrs.playState = false
        video.value!.pause()
    }
    emit('on-play', video.value!)
}

const handleLoadedData = () => {
    videoAttrs.duration = video.value!.duration
    if (videoConfigs.isAutoplay) {
        video.value!.autoplay = true
        videoConfigs.poster = ''
    }
    if (videoConfigs.isMute) {
        video.value!.muted = true
    } else {
        video.value!.volume = volumeProgressWidth.value / 100
    }
}

const handleLoadProgress = () => {
    if (video.value!.buffered.length > 0 && videoAttrs.duration > 0) {
        let value = video.value!.buffered.end(video.value!.buffered.length - 1) * 100 / videoAttrs.duration
        loadProgressWidth.value = handleWidthBorder(value)
    }
}

const handleTimeUpdate = () => {
    let value = video.value!.currentTime * 100 / videoAttrs.duration
    progressWidth.value = handleWidthBorder(value)
    videoAttrs.currentTime = video.value!.currentTime
}

const handlePlayEnd = () => {
    videoAttrs.playState = false
}

const handleError = () => {
    const error = video.value!.error!
    // console.log('视频加载错误：', error.code, error.message);
    emit('on-error', error)
}

const handleWidthBorder = (value: number): number => {
    if (value > 100) {
        value = 100
    }
    if (value < 0) {
        value = 0
    }
    return value
}



</script>

<style lang="less" scoped>
* {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
}

.gd-video-hub-container {
    position: relative;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;

    // &:hover .gd-video-hub-title {
    //     opacity: 1;
    // }

    // &:hover .gd-video-hub-content .controls-container {
    //     opacity: 1;
    // }

    .gd-video-hub-title {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 6%;
        background-color: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(3px);
        z-index: 9999;
        opacity: 0;
        transition: opacity 1s;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        color: #fff;
    }

    .gd-video-hub-content {
        position: relative;
        width: 100%;

        .wrapper {
            width: 100%;

            .wrapper-video {
                display: block;
                width: 100%;
                object-fit: cover;
            }
        }

        .poster {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 199;
            background-repeat: no-repeat;
            background-size: cover;
        }

        .controls-container {
            position: absolute;
            width: 75%;
            height: 20%;
            left: 50%;
            bottom: 7%;
            transform: translateX(-50%);
            z-index: 9999;
            background-color: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(3px);
            border-radius: 8px;
            padding: 2%;
            opacity: 0;
            transition: opacity 1s;

            .controls {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .i-icon {
                    opacity: 0.8;
                    cursor: pointer;

                    &:hover {
                        opacity: 1;
                    }

                    &:active {
                        transform: scale(0.96);
                        opacity: 1;
                    }
                }

                .volume-container {
                    display: flex;
                    align-items: center;

                    .volume-progress-container {
                        width: 100px;
                        height: 5px;
                        border: 1px solid #ccc;
                        border-radius: 12px;
                        background-color: transparent;
                        margin-bottom: 4px;
                        margin-left: 14px;

                        .volume-progress {
                            position: relative;
                            // width: 34%;
                            height: 100%;
                            background-color: #f1f2f6;

                            .volume-bar {
                                position: absolute;
                                top: 50%;
                                right: 0;
                                transform: translate(50%, -50%);
                                width: 12px;
                                height: 12px;
                                border-radius: 50%;
                                background-color: #f1f2f6;
                                cursor: pointer;

                                &:hover {
                                    transform: scale(1.1) translate(50%, -50%);
                                }
                            }
                        }
                    }
                }

                .play-container {
                    flex: 1;
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;
                }

                .setting-container {
                    width: 80px;
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;
                }
            }

            .progress-wrapper {
                width: 100%;
                display: flex;
                height: 50%;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: #fff;

                .progress-container {
                    position: relative;
                    flex: 0.97;
                    height: 5px;
                    border: 1px solid #ccc;
                    border-radius: 12px;
                    background-color: transparent;

                    .progress {
                        position: relative;
                        // width: 34%;
                        height: 100%;
                        background-color: #f1f2f6;

                        .progress-bar {
                            position: absolute;
                            top: 50%;
                            right: 0;
                            transform: translate(50%, -50%);
                            width: 3px;
                            height: 15px;
                            background-color: #fff;
                            border-radius: 12px;
                            cursor: pointer;

                            &:hover {
                                transform: scale(1.2) translate(50%, -50%);
                            }
                        }
                    }

                    .load-progress {
                        position: absolute;
                        top: 0;
                        left: 0;
                        // width: 50%;
                        height: 100%;
                        border-radius: 12px;
                        background-color: #a4b0be;
                        z-index: -1;
                    }
                }

                .time {
                    width: 33px;
                }
            }
        }
    }
}
</style>