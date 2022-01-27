<script lang="ts">
  let value: string;
  let from: number;
  let to: number;
</script>

<input
  type="text"
  value={value.slice(1, value.length - 1)}
  data-from={from}
  data-to={to}
/>
