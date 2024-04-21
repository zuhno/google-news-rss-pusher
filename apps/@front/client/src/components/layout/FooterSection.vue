<template>
  <footer>
    <span>Copyright © {{ new Date().getFullYear() }}. zuhno. All rights reserved.</span>
  </footer>
</template>

<style scoped lang="scss">
footer {
  background-color: black;
  width: 100%;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    color: white;
    font-size: 1rem;
  }
}
</style>
