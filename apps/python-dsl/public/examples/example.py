from dsl import db


old_pattern = "Mister"
new_pattern = "Mr."

with db.change("students") as table:
    table.column("firstName").replace("Mister", "Mr.")
    table.column("secondName").trim("right")
    table.column("firstName").replace(old_pattern, new_pattern)


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
