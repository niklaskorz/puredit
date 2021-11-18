<script lang="ts">
  export let el: HTMLElement;
</script>

<div class="widget" bind:this={el}>
  <div class="inner">
    <div class="head">
      Change table <span class="select"
        ><span class="identifier">students</span> &#9660;</span
      >
    </div>
    <div class="items">
      <div class="item">
        Replace <span class="select"
          ><span class="identifier">firstName</span> &#9660;</span
        >
        in
        <span class="select"><span class="identifier">name</span> &#9660;</span>
        with
        <span class="select"><span class="string">Mr.</span> &#9660;</span>
      </div>
      <div class="item">
        Trim <span class="select"
          ><span class="identifier">lastName</span> &#9660;</span
        >
        on <span class="select"><span class="enum">right</span> &#9660;</span>
      </div>
      <div class="item new">Add new operation...</div>
    </div>
  </div>
</div>

<style>
  .widget {
    padding-bottom: 10px;
    z-index: 100;
  }

  .inner {
    display: inline-block;
    border: 1px solid #000;
  }

  .head {
    padding: 10px;
    border-bottom: 1px solid #000;
  }

  .items {
    padding: 10px;
  }

  .item {
    margin: 5px 0;
  }

  .new {
    font-style: italic;
    color: gray;
    cursor: text;
  }

  .select {
    display: inline-block;
    cursor: pointer;
    padding: 2px 4px;
    border: 1px solid transparent;
    border-radius: 3px;
  }

  .select:hover {
    border: 1px solid #000;
  }

  .identifier {
    font-weight: bold;
  }

  .string {
    color: rgb(153, 18, 18);
  }

  .enum {
    color: rgb(20, 112, 20);
  }
</style>
