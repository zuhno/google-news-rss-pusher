<script lang="ts">
export default {
  data() {
    return {
      isInstalled: false,
    };
  },
  async mounted() {
    const code = this.$route.query.code;

    if (typeof code === "string" && code) {
      const result = await fetch("http://localhost:8080/oauth2", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ code }),
      }).then((res) => res.json());

      if (result) {
        this.isInstalled = true;
        // this.$router.replace("/");
      }
    }
  },
};
</script>

<template>
  <div>
    <div v-if="isInstalled">설치가 완료되었습니다.</div>
    <div v-else>이미 설치가 완료되었습니다.</div>
  </div>
</template>
