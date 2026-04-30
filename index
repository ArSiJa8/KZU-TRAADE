<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fotogalerie Upload</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; padding: 20px; }
        .container { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
        h2 { color: #333; }
        input[type="file"] { margin: 15px 0; width: 100%; }
        #preview { max-width: 100%; margin: 15px 0; border-radius: 10px; display: none; border: 2px solid #ddd; }
        button { background: #007bff; color: white; border: none; padding: 12px; width: 100%; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; }
        button:hover { background: #0056b3; }
        .gallery { margin-top: 40px; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; width: 100%; max-width: 800px; }
        .gallery img { width: 100%; height: 150px; object-fit: cover; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    </style>
</head>
<body>

<div class="container">
    <h2>Foto hochladen</h2>
    <form action="upload.php" method="POST" enctype="multipart/form-data">
        <input type="file" id="fileInput" name="image" accept="image/*" required onchange="showPreview()">
        <img id="preview" src="">
        <button type="submit">Bild veröffentlichen</button>
    </form>
</div>

<div class="gallery">
    <?php
    // uploads
    $ordner = "uploads/"; 

    if (is_dir($ordner)) {
        $bilder = glob($ordner . "*.{jpg,jpeg,png,gif,webp}", GLOB_BRACE);
        foreach ($bilder as $bild) {
            echo '<img src="'.$bild.'" alt="User Foto">';
        }
    }
    ?>
</div>

<script>
    function showPreview() {
        const file = document.getElementById('fileInput').files[0];
        const preview = document.getElementById('preview');
        const reader = new FileReader();
        reader.onloadend = () => { preview.src = reader.result; preview.style.display = 'block'; }
        if (file) reader.readAsDataURL(file);
    }
</script>

</body>
</html>
