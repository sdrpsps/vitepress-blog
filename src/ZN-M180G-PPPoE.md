---
title: 移动 ZN-M180G 光猫 获取 PPPOE 信息
date: 2022-8-16 10:52:30
---

# 移动 ZN-M180G 光猫 获取 PPPOE 信息

::: tip
太长不看：默认PPPoE密码是手机号的后6位
:::

## 一、背景

坐标广东，光猫型号是兆能ZN-M180G，其他型号可能有所不同。移动师傅上门安装时不在家，当时已经提前说要改桥接的，回到家才发现没改，那我就自己改吧。根据网上教程获取PPPoE只要把 `input` 的 `text` 从password改成text就可以显示明文密码了，不过这型号改了依旧是写死的*，只知道账号不行啊，就有了以下折腾过程（问就是生命在于折腾）～

## 二、开启Telnet

1. 使用默认普通账户登录。

2. [开启Telnet](http://192.168.1.1/getpage.gch?pid=1002&nextpage=tele_sec_tserver_t.gch)，保存

3. Telnet账号为 `CMCCAdmin`  默认密码为 `aDm8H%MdA`

## 三、拷贝配置文件

1. 使用Telnet账号密码登录光猫Telnet

2. 输入 `su` 切换到超级用户，密码依旧为 `aDm8H%MdA`

3. 输入命令复制 `db_user_cfg.xml` 文件

   ```shell
   cp /userconfig/cfg/db_user_cfg.xml /mnt/
   cd /mnt/
   chmod 777 db_user_cfg.xml
   ```

4. 开启光猫自带FTP功能，匿名访问

5. 下载 `db_user_cfg.xml` 文件到本地

## 四、解密配置文件

1. 因为 `db_user_cfg.xml` 文件是加密的，不能通过编辑器正常打开

2. 参考链接3里面写的是中兴方案，不过我看文件名都是一样的，所以打算试一试

3. 将代码保存为 `py` 执行文件

   ```python
   '''
   pip install pycrypto
   '''
   from Crypto.Cipher import AES
   from binascii import a2b_hex
   KEY = b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
   def decrypt(text):
       cryptor = AES.new(KEY, AES.MODE_ECB)
       plain_text = cryptor.decrypt(a2b_hex(text))
       return plain_text
   cfg_file = open("db_user_cfg.xml", "rb")
   dec_file = open("db_user_cfg.decode.xml", "w")
   file_header = cfg_file.read(60)
   while 1:
       trunk_info = cfg_file.read(12)
       trunk_data = cfg_file.read(65536)
       trunk_real_size = int.from_bytes(trunk_info[0:4], byteorder='big', signed=False)
       trunk_size = int.from_bytes(trunk_info[4:8], byteorder='big', signed=False)
       next_trunk = int.from_bytes(trunk_info[8:12], byteorder='big', signed=False)
       print(trunk_real_size, trunk_size, next_trunk)
       dec_file.write(decrypt(trunk_data.hex()).decode(encoding="utf-8"))
       if next_trunk==0:
           break
   ```

4. 接下来的步骤我默认是已安装好Python3环境，具体安装请自行搜索

5. 输入 `pip install pycrypto` 安装依赖包

6. 把创建的 `py` 文件和 `db_user_cfg.xml` 文件放在同一个目录中

7. 输入 `python3 文件名称.py` 执行解密

8. 解密完成后会生成 `db_user_cfg.decode.xml` 文件，该文件就是解密后的文件

9. 搜索自己的PPPoE账号，下一行就是你的PPPoE密码了，然后开始进行改桥接吧，到此结束

## 五、参考链接

1. [恩山论坛](https://www.right.com.cn/FORUM/thread-7362164-1-1.html)

2. [CSDN](https://blog.csdn.net/gsls200808/article/details/118517821)

3. [52破解](https://www.52pojie.cn//thread-1577267-1-1.html)
