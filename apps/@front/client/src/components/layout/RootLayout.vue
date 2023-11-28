<script lang="ts">
export default {};
</script>

<template>
  <article>
    <slot></slot>
  </article>
</template>

<style scoped lang="scss">
article {
  margin-top: 70px;
  padding-top: 20px;
  min-height: calc(100dvh - 70px);
  box-sizing: border-box;
}
</style>
