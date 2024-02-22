import tkinter as tk
from tkinter import filedialog
import os
import modules.photomodule as pm

# 定義初始參數
selected_path = None
output_path = None
black_or_white_background = "B"

# 選擇單一檔案路徑
def input_file_select():
    global selected_path
    selected_path = filedialog.askopenfilename(title="選擇輸入檔案", filetypes=[("JPEG files", "*.jpg"), ("All files", "*.*")])
    input_show.config(text="輸入位置: " + selected_path)

# 選擇批輛處理資料夾路徑
def input_directory_select():
    global selected_path
    selected_path = filedialog.askdirectory(title="選擇輸入目錄")
    input_show.config(text="輸入位置: " + selected_path)    

# 選擇輸出資料夾路徑
def output_directory_select():
    global output_path
    output_path = filedialog.askdirectory(title="選擇輸出目錄")    
    output_show.config(text="輸出位置: " + output_path)

# 調整照片解析度成 x 方向為1080
def resize_image():
    if selected_path and os.path.isfile(selected_path):
        pm.Adjustment_Resolution(selected_path, output_path, 1080)
    elif selected_path and os.path.isdir(selected_path):
        jpgfile = [file for file in os.listdir(selected_path) if file.endswith((".jpg", ".jpeg", ".JPG", ".png"))]
        for file in jpgfile:
            pm.Adjustment_Resolution(os.path.join(selected_path, file), output_path, 1080)

# 調整照片解析度成使用者設定數值
def resize_image2():
    if selected_path and os.path.isfile(selected_path):
        target_resolution = int(resolution_entry.get())  # 取得使用者輸入的解析度值
        pm.Adjustment_Resolution(selected_path, output_path, target_resolution)
    elif selected_path and os.path.isdir(selected_path):
        jpgfile = [file for file in os.listdir(selected_path) if file.endswith((".jpg", ".jpeg", ".JPG", ".png"))]
        for file in jpgfile:
            target_resolution = int(resolution_entry.get())  # 取得使用者輸入的解析度值
            pm.Adjustment_Resolution(os.path.join(selected_path, file), output_path, target_resolution)

# 拓寬照片成 IG 直幅照片(1080*1350)缺的部分用黑或白補滿
def border_image():
    if selected_path and os.path.isfile(selected_path):
        pm.Adjust_vertical_photo_ratio(selected_path, output_path, black_or_white_background)
    elif selected_path and os.path.isdir(selected_path):
        jpgfile = [file for file in os.listdir(selected_path) if file.endswith(".jpg")]
        for file in jpgfile:
            pm.Adjust_vertical_photo_ratio(os.path.join(selected_path, file), output_path, black_or_white_background)

# 切換並顯示目前是使用黑色或白色補滿
def black_or_white_background_select():
    global black_or_white_background
    if black_or_white_background == "B":
        black_or_white_background = "W"
        black_or_white_show.config(text="目前: 白")
    elif black_or_white_background == "W":
        black_or_white_background = "B"
        black_or_white_show.config(text="目前: 黑")

# 設定照片壓縮品質(滑桿)
def get_quality(self):
    global quality
    quality = quality_scale.get()

# 壓縮照片成指定品質
def compress_image():
    if selected_path and os.path.isfile(selected_path):
        pm.compress_image(selected_path, output_path, quality)
    elif selected_path and os.path.isdir(selected_path):
        jpgfile = [file for file in os.listdir(selected_path) if file.endswith((".jpg", ".jpeg", ".JPG", ".png"))]
        for file in jpgfile:
            pm.compress_image(os.path.join(selected_path, file), output_path, quality)


win = tk.Tk() # 建立主視窗

# 標題
win.title("photo editor")

# 視窗調整
win.geometry("800x500") # 解析度
win.resizable(0,0) # 不可調整大小

# Button(單一檔案)
input_file = tk.Button(win, text="單一檔案", command=input_file_select)
input_file.config(font=("微軟正黑體", 14))
input_file.place(x=10, y=10)

# Button(批量操作)
input_directory = tk.Button(win, text="批量操作", command=input_directory_select)
input_directory.config(font=("微軟正黑體", 14))
input_directory.place(x=120, y=10)

# Button(輸出目錄位置)
output_directory = tk.Button(win, text="輸出目錄位置", command=output_directory_select)
output_directory.config(font=("微軟正黑體", 14))
output_directory.place(x=10, y=90) 

# Button(解析度調整成IG上大小)
resize = tk.Button(win, text="解析度調整成IG上大小", bg="yellow", command=resize_image)
resize.config(font=("微軟正黑體", 14))
resize.place(x=10, y=190)

# Button(調整直幅照片成IG大小)
Border = tk.Button(win, text="調整直幅照片成IG大小", bg="yellow", command=border_image)
Border.config(font=("微軟正黑體", 14))
Border.place(x=10, y=250)

# Button(黑或白)
black_or_white = tk.Button(win, text="黑或白", command=black_or_white_background_select)
black_or_white.config(font=("微軟正黑體", 14))
black_or_white.place(x=230, y=250)

# Button(壓縮)
compress_button = tk.Button(win, text="壓縮", bg="yellow", command=compress_image)
compress_button.config(font=("微軟正黑體", 14))
compress_button.place(x=430, y=300)

# Button(以設定的解析度處理圖片)
process_button = tk.Button(win, text="以設定的解析度處理圖片", bg="yellow", command=resize_image2)
process_button.config(font=("微軟正黑體", 14))
process_button.place(x=500, y=190)

# Lable(輸入位置:)[預設]
input_show = tk.Label(win, text="輸入位置: ")
input_show.config(font=("微軟正黑體", 12))
input_show.place(x=10, y=60)

# Lable(輸出位置:)[預設]
output_show = tk.Label(win, text="輸出位置: ")
output_show.config(font=("微軟正黑體", 12))
output_show.place(x=10, y=140)

# Lable(目前: 黑)[預設]
black_or_white_show = tk.Label(win, text="目前: 黑")
black_or_white_show.config(font=("微軟正黑體", 14))
black_or_white_show.place(x=310, y=257)

# Scale(滑桿設定)
quality_scale = tk.Scale(orient="horizontal", length=300)
quality_scale.config(command=get_quality)
quality_scale.set(85)
quality_scale.place(x=100, y=300)

# Lable(輸入解析度:)
resolution_label = tk.Label(win, text="輸入解析度:")
resolution_label.config(font=("微軟正黑體", 14))
resolution_label.place(x=230, y=197)

# Entry(解析度輸入框)
resolution_entry = tk.Entry(win, width=10)
resolution_entry.config(font=("微軟正黑體", 14))
resolution_entry.place(x=350, y=197)

# Lable(壓縮率：)
quality_label = tk.Label(win, text="壓縮率：")
quality_label.config(font=("微軟正黑體", 14))
quality_label.place(x=10, y=312)

win.mainloop() # 常駐主視窗