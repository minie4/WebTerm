document.addEventListener("DOMContentLoaded", () => {
    var emulator = new V86Starter({
        wasm_path: "assets/v86.wasm",
        memory_size: 512 * 1024 * 1024,
        vga_memory_size: 100 * 1024 * 1024,
        screen_container: document.getElementById("screen_container"),
        bios: {
            url: "images/seabios.bin",
        },
        vga_bios: {
            url: "images/vgabios.bin",
        },
        cdrom: {
            url: "images/os.iso",
        },
        autostart: true,
    });
})