// This is the live demo to the paper Virtual Domain Specific Languages via
// Embedded Projectional Editing by Niklas Korz and Artur Andrzejak, published
// at 22nd International Conference on Generative Programming:
// Concepts & Experiences (GPCE 2023), in conjunction with ACM SPLASH 2023,
// 22-27 October 2023, Cascais, Portugal.

// On the left, you see the projectional editor and on the right, the
// underlying textual source code. Both edit the same model and any changes
// to one side are reflected directly on the other side.

// 1. Simplest example:
// A function call is replaced by a projection with a text field.
console.log("Hello world!");

// 2. Nested example:
// The outer projection "change" provides context to projections within in.
// This context is used by projections "trim" and "replace" to provide a list
// of columns for the user to pick from.
((table) => {
  table["name"] = table["name"].trim("right");
  table["lecturer"] = table["lecturer"].replace("Mister ", "Mr. ");
})(db["lectures"]);

// 3. Complex example:
// Projections can be mixed into code in the host language.
function x(input: number, name: string) {
  console.log("Hello world!");
  if (name == "puredit") {
    while (input < 42) {
      ((table) => {
        // A quick comment
        table["secondName"] = table["secondName"].replace("Mister ", "Mr. ");
        input += 1;
        console.log("Mixing projections with code");
        table["firstName"] = table["firstName"].trim("both");
      })(db["students"]);
    }
  }
}
