for i in range(1, 101):
    if i % 4 == 0 and i % 5 == 0:
        print("Graf&Pos")
    elif i % 4 == 0:
        print("Graf")
    elif i % 5 == 0:
        print("Pos")
    else:
        print(i)
