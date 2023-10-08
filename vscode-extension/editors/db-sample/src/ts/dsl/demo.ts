import { text } from "./api";
import { db } from "./db";

// Store a value in table "students" column "name"
db.students.name = "Hello world";
// Load a value from column "firstName" and store in "name"
db.students.name = db.students.firstName;
// Concat two columns with a space inbetween and store in name
db.students.name = db.students.firstName.add(" ").add(db.students.secondName);
db.students.name = text`${db.students.firstName} ${db.students.secondName}`;
// Trim whitespace character on left and right of name column
db.students.name = db.students.name.trim(); // or .trim("both")
// Trim whitespace character on left of name column
db.students.name = db.students.name.trim("left");
// Trim whitespace character on right of name column
db.students.name = db.students.name.trim("right");
// Take only characters from zero-based index 2 to 5 from name
db.students.name = db.students.name.slice(2, 5);
// Replace firstName in name with "Mr. "
db.students.name = db.students.name.replace(db.students.firstName, "Mr. ");
// Replace pairs in column name
db.students.name = db.students.name.replaceAll(
  [db.students.firstName, "Mr. "],
  [db.students.secondName, "Hello"]
);
// Replace value in column with empty string
db.students.name = db.students.name.remove("some swear word");
// Lower case the whole string
db.students.name = db.students.name.toLower();
// Upper case the whole string
db.students.name = db.students.name.toUpper();
// Extract first occurence of pattern
db.students.name = db.students.name.extractOne("{hashtag}");
// Extract groups with pattern
//db.students[firstName, secondName] = db.students.name.extractAll("([a-z]+) ([a-z]+)")
// Replace pattern in name with "Mr. "
db.students.name = db.students.name.patternReplace("{email}", "Mr. ");
// Replace pattern pairs in column "name"
db.students.name = db.students.name.patternReplaceAll(
  ["{email}", "Mr. "],
  ["[a-z]+", "Hello"],
  ["{hashtag}", "there"]
);
// Split column
//db.students[firstName, secondName] = db.students.name.split(" ")

db.students["name"] = db.students["name"].trim("right");
