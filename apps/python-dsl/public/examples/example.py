from dsl import db


def x(input, name):
    print("Hello world!")
    if True:
        while 2 < 1:
            with db.change("lectures") as table:
                table.column("lecturer").replace("<target>", "<value>")
                table.column("name").trim("both")


with db.change("students") as table:
    table.column("firstName").replace("Mister", "Mr.")
    table.column("secondName").trim("right")

y = 42
y + 10

if y > 42:
    x = 3
