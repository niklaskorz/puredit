import mathdsl

# Math term transformed into function
f, args = mathdsl.compile("20\\pi^2+\\sin x")
print("f(x):", f(x=90))

# Math term with a matrix
rotate, args = mathdsl.compile("\\begin{pmatrix}\\cos\\theta & -\\sin\\theta\\\\ \\sin\\theta & \\cos\\theta\\end{pmatrix}\\begin{pmatrix}x\\\\ y\\end{pmatrix}")
print("rotate(x, y, theta):")
print(rotate(x=1, y=2, theta=0.5))

# Math term evaluated immediately, using variables from local scope
r = 5
x = mathdsl.evaluate("r^r", locals())
print("x:", x)
