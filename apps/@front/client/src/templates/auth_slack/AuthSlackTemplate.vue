<script lang="ts">
interface InstalledData {
  active: string;
  ch_id: string;
  ch_name: string;
  ch_url: string;
  noti_interval: number;
}

export default {
  data(): {
    installedData: InstalledData | null;
  } {
    return {
      installedData: null,
    };
  },
  async mounted() {
    const code = this.$route.query.code;

    if (typeof code === "string" && code) {
      fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/oauth2`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json() as Promise<InstalledData[]>)
        .then((res) => {
          console.log(res);
          if (res.length > 0 && res[0].ch_id) {
            this.installedData = res[0];
            setTimeout(() => {
              this.$router.replace("/");
            }, 4000);
          }
        })
        .catch((err) => {
          console.log("wat");
        });
    }
  },
};
</script>

<template>
  <div>
    <div v-if="installedData">{{ installedData.ch_name }} 채널에 설치가 완료되었습니다.</div>
  </div>
</template>
