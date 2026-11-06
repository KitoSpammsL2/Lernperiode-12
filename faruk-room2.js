const level2Objects = document.querySelectorAll(
    "[data-faruk-object]"
);

const level2Message = document.getElementById(
    "farukRoom2Message"
);

const objectMessages = {
    konsole:
        "Die Konsole zeigt beschädigte Systemdaten. " +
        "Einige Informationen sind verschlüsselt.",

    energie:
        "Der Energiekern ist instabil. " +
        "Du musst die Energieversorgung untersuchen.",

    speicher:
        "Das Speichermodul enthält unbekannte Dateien. " +
        "Vielleicht versteckt sich darin ein Hinweis.",

    ausgang:
        "Der Ausgang ist gesichert. " +
        "Löse zuerst die Rätsel dieses Levels."
};

level2Objects.forEach(object => {

    object.addEventListener("click", () => {

        const objectName = object.dataset.farukObject;

        level2Message.textContent =
            objectMessages[objectName] ||
            "Unbekanntes Objekt.";

        // Anklickbares Objekt optisch hervorheben
        level2Objects.forEach(item => {
            item.style.borderColor = "";
        });

        object.style.borderColor = "#00ffff";

        console.log("Level-2-Objekt:", objectName);
    });

});
