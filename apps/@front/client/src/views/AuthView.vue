<script lang="ts">
export default {
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
        this.$router.replace("/");
      }
    }
  },
};
</script>

<template>
  <div></div>
</template>
