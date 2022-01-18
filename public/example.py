from dsl import db

def x(input, name):
    print("Hello world!")
    if True:
        while 2 < 1:
            with db.change("rooms") as table:
                table.column("lastName").replace("<target>", "<value>")
                table.column("firstName").trim("both")

with db.change("students") as table:
    table.column("name").replace("Mister", "Mr.");
    table.column("lastName").trim("right");

y = 42
y + 10

if y > 42:
    x = 3
