var term;
var termfit;
var emulator;

var booted = false;

// Login as root
const username = "root";

// Start a shell on /dev/console for debugging,
// set the TERM variable to a colored terminal,
// fix enter key on some applications
// and resize commands and execute the welcome script
const welcomecmd = 'screen -d -m sh -c "sh </dev/console >/dev/console 2>&1;read";TERM="xterm-256color";stty sane;/etc/init.d/S99welcome';

document.addEventListener("DOMContentLoaded", () => {
    // Show the internal screen if "#debug" is appended to the url
    var v86_display = undefined;
    if(window.location.hash == "#debug") {
        document.getElementById("screen").classList.add("visible");
    }

    // Initialize the v86 emulator
    emulator = new V86Starter({
        wasm_path: "assets/v86.wasm",
        memory_size: 512 * 1024 * 1024,
        vga_memory_size: 100 * 1024 * 1024,
        screen_container: document.getElementById("screen"),
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

    // Initialize xterm.js
    term = new Terminal({
        rendererType: 'dom',
    });
    termcontainer = document.getElementById('terminal');
    term.open(termcontainer);

    // Initialize the xterm-fit addon
    termfit = new FitAddon.FitAddon();
    term.loadAddon(termfit);
    termfit.fit();

    // Write a "Booting WebTerm ..." message
    term.write('\033[1;34mDownloading\033[0m OS images ...\r\n')

    // Forward keystrokes from xterm to v86
    term.onKey(key => onConsoleInput(key));   
    // Forward output from v86 to xterm and other functions 
    emulator.add_listener("serial0-output-char", (char) => onConsoleOutput(char));
    emulator.add_listener("serial0-output-line", (line) => onConsoleLine(line));

    // Wait for the emulator to get ready
    emulator.add_listener("emulator-ready", () => {
        term.write('Booting \x1B[1;3;31mWebTerm\x1B[0m ...\r\n')
    })
})

function onConsoleOutput(char) {
    // Only write to the xterm if the system is fully booted
    if(booted) {
        term.write(char);
    }
    // If the char is the shell prompt after the login message start
    // the welcome script and set bootet to true
    if(char == "#" && previous_line.includes("buildroot login: "+username)) {
        emulator.serial0_send(welcomecmd+"\n")
        resize();
        booted = true;
    }
}

var debugcnt = 0;
var debugword = "+++debug+++"
function onConsoleInput(key) {
    // Paste (Strg+Alt+V)
    if((key.domEvent.key == "v") && key.domEvent.altKey && key.domEvent.ctrlKey) {
        debug("paste")
        navigator.clipboard.readText().then((text) => {
            emulator.serial0_send(text)
        })
        return;
    }

    // Copy (Strg+Alt+C)
    if((key.domEvent.key == "c") && key.domEvent.altKey && key.domEvent.ctrlKey) {
        debug("copy")
        document.execCommand("copy")
        return;
    }

    // Send keys from xterm to v86
    emulator.serial0_send(key.key)

    // Listen for the debug key combination
    if(key.key == debugword[debugcnt]) {
        debugcnt++;
    } else {
        debugcnt = 0;
    }
    if(debugcnt == debugword.length) {
        document.getElementById("screen").classList.toggle("visible"); 
    }
    debug("debugcnt "+debugcnt)
}

var previous_line = "";
function onConsoleLine(line) {
    // Enter username on the login prompt
    if (line.startsWith("Welcome to WebTerm")) {
        emulator.serial0_send(username+"\n")
    }
    // Save the line
    previous_line = line;
}

// Resize the terminal
window.addEventListener("resize", () => {
    resize();
})

function resize() {
    // Resize the terminal
    termfit.fit();

    // Send tty resize over /dev/console so that the user can't see it
    emulator.keyboard_send_text(`stty cols ${term.cols} rows ${term.rows} -F /dev/ttyS0\n`)
}

function debug(text) {
    console.debug("DEBUG: "+text)
}