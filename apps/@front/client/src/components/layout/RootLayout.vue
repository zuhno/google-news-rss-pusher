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
  min-height: calc(100dvh - 70px);
  box-sizing: border-box;
  max-width: 700px;
  margin: 70px auto 100px;
  padding: 0 20px;
  padding-top: 40px;
}
</style>
