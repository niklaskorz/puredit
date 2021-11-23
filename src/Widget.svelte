<script lang="ts">
  import Select from "svelte-select";

  let operations = [
    [
      { type: "label", value: "Replace" },
      { type: "identifier", value: "firstName" },
      { type: "label", value: "in" },
      { type: "identifier", value: "name" },
      { type: "label", value: "with" },
      { type: "string", value: "Mr." },
    ],
    [
      { type: "label", value: "Trim" },
      { type: "identifier", value: "lastName" },
      { type: "label", value: "on" },
      { type: "enum", value: "right" },
    ],
  ];

  let items = [
    { value: "chocolate", label: "Chocolate" },
    { value: "pizza", label: "Pizza" },
    { value: "cake", label: "Cake" },
    { value: "chips", label: "Chips" },
    { value: "ice-cream", label: "Ice Cream" },
  ];

  let value = { value: "cake", label: "Cake" };

  function handleSelect(event: any) {
    console.log("selected item", event.detail);
    // .. do something here 🙂
  }
</script>

<div class="inner">
  <div class="head">
    Change table <span class="select"
      ><span class="identifier">students</span> &#9660;</span
    >
  </div>
  <div class="items">
    {#each operations as op}
      <div class="item">
        {#each op as part}
          {#if part.type === "label"}
            {part.value}
          {:else}
            <span class="select">
              <span class={part.type}>{part.value}</span> &#9660;
            </span>
          {/if}{" "}
        {/each}
      </div>
    {/each}
    <div class="item new">
      <Select
        placeholder="Add new operation..."
        {items}
        on:select={handleSelect}
      />
    </div>
  </div>
</div>

<style>
  .inner {
    margin: 0;
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
    margin-top: 15px;
    /*font-style: italic;
    color: gray;
    cursor: text;*/
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
