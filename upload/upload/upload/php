<?php
// --- HIER DEINEN SPEICHERORT ANPASSEN ---
$ziel_ordner = "uploads/"; 
// ---------------------------------------

// Prüfen, ob der Ordner existiert, sonst erstellen
if (!file_exists($ziel_ordner)) {
    mkdir($ziel_ordner, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['image'])) {
    $datei_name = basename($_FILES["image"]["name"]);
    $ziel_datei = $ziel_ordner . time() . "_" . $datei_name; // Zeitstempel verhindert Überschreiben
    $bild_typ = strtolower(pathinfo($ziel_datei, PATHINFO_EXTENSION));

    // Erlaubte Formate
    $erlaubt = array("jpg", "jpeg", "png", "gif", "webp");

    if (in_array($bild_typ, $erlaubt)) {
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $ziel_datei)) {
            // Erfolg: Zurück zur Hauptseite
            header("Location: index.php?status=success");
        } else {
            echo "Fehler beim Verschieben der Datei.";
        }
    } else {
        echo "Nur Bilder (JPG, PNG, GIF, WEBP) sind erlaubt.";
    }
}
?>
