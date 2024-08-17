<script setup lang="ts">
const adIds = [
  "801321", // 추천 상품 피드
  "801322", // 파트너스 추천
  "801323", // 생활용품
  "801324", // 가전디지털
  "801325", // 반려동물용품
  "801329", // 홈인테리어
  "801330", // 남성패션
  "801332", // 스포츠/레저
];

function makeRandomAdsUrl() {
  const adId = adIds[Math.floor(Math.random() * adIds.length)];
  return `https://ads-partners.coupang.com/widgets.html?id=${adId}&template=carousel&trackingCode=AF2052246&subId=&width=500&height=110&tsource=`;
}
</script>

<template>
  <div>
    <iframe
      :src="makeRandomAdsUrl()"
      frameborder="0"
      scrolling="no"
      referrerpolicy="unsafe-url"
      browsingtopics
    ></iframe>
    <span>* 쿠팡 파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.</span>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/scss/variables";
@import "@/assets/scss/mixins";

iframe {
  width: 100%;
  height: 150px;

  @include mqMax($breakpoint-mobile) {
    height: 110px;
  }
}

span {
  color: #adadad;
  font-size: 10px;
  font-weight: 400;
  line-height: 100%;
}
</style>
