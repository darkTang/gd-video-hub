<template>
  <div>
    <gd-video-hub :video-options="videoOptions" />
  </div>
</template>

<script setup lang="ts">
import GdVideoHub from './components/index.vue';
import { VideoOptionsType } from './types/video-options-type';

const videoOptions: VideoOptionsType = {
  src: '/矮头图.mp4',
  poster: '/矮头图-兜底.jpg',
  isShowControls: false,
  isShowTitle: false,
  isAutoplay: true,
  isMute: true,
  isLoop: true
}

</script>

<style lang="less" scoped>
div {
  box-sizing: border-box;
  width: 700px;
}
</style>