<template>
  <footer>
    <span>Copyright © {{ new Date().getFullYear() }}. zuhno. All rights reserved.</span>
  </footer>
</template>

<style scoped lang="scss">
footer {
  background-color: black;
  padding: 8px 0;
  display: flex;
  justify-content: center;

  span {
    color: white;
  }
}
</style>
