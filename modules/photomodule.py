# import zone
from PIL import Image
import os

# 壓縮照片x方向成指定大小
def Adjustment_Resolution(input_file, output_path, target_width):
    # Open Original Photo
    original_image = Image.open(input_file)

    # Obtain the width and height of the original photo.
    original_width, original_height = original_image.size

    # Calculating the scaling ratio.
    scale_factor = target_width / original_width
    new_height = int(original_height * scale_factor)

    # Resize photos.
    resized_image = original_image.resize((target_width, new_height))

    # Save the processed photo.
    output_file = os.path.join(output_path, os.path.basename(input_file))
    resized_image.save(output_file)


# 調整照片成IG發文使用(1080*1350)，多的用顏色填滿
def Adjust_vertical_photo_ratio(input_file, output_path, color):
    # Open Original Photo
    original_image = Image.open(input_file)

    # 確認 EXIF 中的方向資訊
    if hasattr(original_image, '_getexif'):
        exif = original_image._getexif()
        if exif is not None and 274 in exif:
            orientation = exif[274]
            # Processing based on rotation information.
            if orientation == 3:
                original_image = original_image.rotate(180, expand=True)
            elif orientation == 6:
                original_image = original_image.rotate(270, expand=True)
            elif orientation == 8:
                original_image = original_image.rotate(90, expand=True)

    # Obtain the width and height of the original photo.
    original_width, original_height = original_image.size

    # Adjusts the resolution to the IG upper line and calculates the new width.   
    if original_height > original_width:
        new_height = int(1350)
        new_width = int((new_height / original_height) * original_width)
        target_width = int(1080)
        target_height = int(1350)
    else:
        new_height = int(1080 / original_width * original_height)
        new_width = int(1080)
        target_width = int(1080)
        target_height = int(1350)


    # Resize photos
    resized_image = original_image.resize((new_width, new_height))

    # Create a new canvas and fill it with the background colour (black or white).
    if color == "w" or color == "W":
        final_image = Image.new("RGB", (target_width, target_height), (255, 255, 255))
    elif color == "b" or color == "B":
        final_image = Image.new("RGB", (target_width, target_height), (0, 0, 0))
    else:
        print("Error!! Colour not supported. Only \"B\"lack or \"W\"hite.")
        exit()

    # Calculate the width of the left and right black borders.
    border_width = (target_width - new_width) // 2
    vertical_border = (target_height - new_height) // 2

    # Post the adjusted photo.
    final_image.paste(resized_image, (border_width, vertical_border))

    # Save the processed photo.
    output_file = os.path.join(output_path, os.path.basename(input_file))
    final_image.save(output_file)


# 壓縮照片成給定壓縮率
def compress_image(input_file, output_path, quality):
    # Open Original Photo
    original_image = Image.open(input_file)
    output_file = os.path.join(output_path, os.path.splitext(os.path.basename(input_file))[0] + ".jpg")
    original_image.convert("RGB").save(output_file, format="JPEG", quality=quality)