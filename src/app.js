const SEL_MIC = document.getElementById("micSelect");
const SEL_SPEAKER = document.getElementById("speakersSelect");
const SEL_SCREEN = document.getElementById("screenSelect");

/**
 * Loop music.mp3.
 * @returns Audio instance.
 */
const loopMusic = () => {
  const aud = new Audio("./music.mp3");
  aud.play();

  // replay mp3 on ended
  aud.addEventListener("ended", () => aud.play());

  return aud;
};

// Set AUDIO constant so we can use it for changing speaker below.
const AUDIO = loopMusic();

/**
 * Move app to another screen.
 * @param {*} id Screen ID.
 * @param {*} save If should also save settings.
 *  Useful for when using this method to set the default screen,
 *  we don't want to save what we just fetched from the settings.json file.
 */
const changeScreen = (id, save = true) => {
  localStorage.setItem("screen", id);
  window.api.send("change-display", id);

  if (save) window.api.send("save-settings");
};

/**
 * Change the current speaker being used to play audio.
 * @param {*} id Speaker device ID.
 * @param {*} save If should also save settings.
 *  Useful for when using this method to set the default screen,
 *  we don't want to save what we just fetched from the settings.json file.
 */
const changeSpeaker = (id, save = true) => {
  localStorage.setItem("speaker", id);
  AUDIO.setSinkId(id);

  if (save) window.api.send("save-settings");
};

/**
 * Create an <option>.
 * @param {*} text Text to display.
 * @param {*} data Data to bind to the `value` in the option.
 * @returns
 */
const createOption = (text, data) => {
  return `<option value="${data}">${text}</option>`;
};

/**
 * Fetch all media devices.
 * Put audioinput (mic) and audiooutput (speaker) devices
 * in the correct dropdown.
 */
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

    const speaker = localStorage.getItem("speaker");
    if (speaker) {
      SEL_SPEAKER.value = `${speaker}`;
      changeSpeaker(SEL_SPEAKER.value, false);
    }
  })
  .catch((err) => {
    console.error(err.name + ": " + err.message);
  });

/**
 * Get all displays and add them to the dropdown.
 */
window.api.invoke("get-displays").then((screens) => {
  screens.forEach((screen, i) => {
    SEL_SCREEN.insertAdjacentHTML(
      "beforeend",
      createOption(
        `Screen ${i} - ${screen.id} width: ${screen.bounds.width} height: ${screen.bounds.height} bounds: ${screen.bounds.x},${screen.bounds.y}</option>`,
        screen.id
      )
    );
  });

  const screen = localStorage.getItem("screen");
  if (screen) {
    SEL_SCREEN.value = `${screen}`;
    changeScreen(SEL_SCREEN.value, false);
  }
});

/**
 * Listen for dropdown changes and update speaker/screen occordingly.
 */
SEL_SCREEN.addEventListener("change", (ev) => changeScreen(ev.target.value));
SEL_SPEAKER.addEventListener("change", (ev) => changeSpeaker(ev.target.value));
