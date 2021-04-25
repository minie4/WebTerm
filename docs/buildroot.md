# Buildroot
The Linux iso for WebTerm is built using Buildroot. If you want to build a custom iso, you can use the provided config ([buildroot-config](buildroot-config)) and tweak it.

## Building a custom iso
Fist you need to download Buildroot. To do that, you can just clone the Buildroot GitHub repository to your computer:
```
git clone https://github.com/buildroot/buildroot
cd buildroot
```
Then you can copy the [buildroot-config](buildroot-config) file into the buildroot directory and rename it to `.config`

To change the settings for your image, you can use the `menuconfig` option of Buildroot. There you can click trough the menu and change some of the settings.
```
make menuconfig
```
Dont forget to select the `Save` option if you are done.

If you are done configuring your linux, you can compile it. This will take some time and disk space.
```
make
```
If the compilation is completed, you find your iso file under `output/images/rootfs.iso9660`. You can rename it to `os.iso` and put it into the images directory of WebTerm.

Tip: You can add `#debug` to the URL of WebTerm to display the screen of the virtual computer and get some debug information.