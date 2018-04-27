# display the size of a picture

from PIL import Image

img = Image.open("ms.jpg")
print(img.size)

img = img.resize((512, 512),Image.ANTIALIAS)

img.save("mars.jpg")
