const SEL_MIC = document.getElementById("micSelect");
const SEL_SPEAKER = document.getElementById("speakersSelect");
const SEL_SCREEN = document.getElementById("screenSelect");

console.log(window.api);
console.log(window.api.invoke("get-displays"));

const aud = new Audio("./music.mp3");
aud.play();

// replay mp3 on ended
aud.addEventListener("ended", () => {
  aud.play();
});

const createOption = (text, data) => {
  return `<option value="${data}">${text}</option>`;
};

navigator.mediaDevices
  .enumerateDevices()
  .then((devices) => {
    devices.forEach((device) => {
      const opt = createOption(device.label, device.deviceId);

      switch (device.kind) {
        case "audioinput":
          SEL_MIC.insertAdjacentHTML("beforeend", opt);
          break;

        case "audiooutput":
          SEL_SPEAKER.insertAdjacentHTML("beforeend", opt);
          break;
      }
    });
  })
  .catch((err) => {
    console.error(err.name + ": " + err.message);
  });

window.api.invoke("get-displays").then((screens) => {
  screens.forEach((screen, i) => {
    console.log(screen);

    SEL_SCREEN.insertAdjacentHTML(
      "beforeend",
      createOption(
        `Screen ${i} - ${screen.id} width: ${screen.bounds.width} height: ${screen.bounds.height} bounds: ${screen.bounds.x},${screen.bounds.y}</option>`,
        screen.id
      )
    );
  });
});

SEL_SCREEN.addEventListener("change", (ev) => {
  window.api.send("change-display", ev.target.value);
});

SEL_SPEAKER.addEventListener("change", (ev) => {
  console.log("Changing audio output device to:", ev.target.value);
  aud.setSinkId(ev.target.value);
});
