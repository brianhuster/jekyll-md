
window.onload = function() {
    if (localStorage.getItem('jekyll_md')) {
        document.getElementById('markdown').value = localStorage.getItem('jekyll_md');
    }
    updatePreview();
    try {
        localStorage.setItem('jekyll_md', markdownText);
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Local storage is full. Please clear it if you want your markdown to be saved for the next session.');
        }
    }
};

function updatePreview() {
    var markdownText = document.getElementById('markdown').value;
    document.getElementById('preview').innerHTML = "<article>"+headerPreview(markdownText) + contentPreview(markdownText)+"</article>";
    //lưu text vào local storage
    localStorage.setItem('jekyll_md', markdownText);
    try {
        localStorage.setItem('jekyll_md', markdownText);
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.log('Local storage is full. Please clear it if you want your markdown to be saved for the next session.');
        }
    }
}
function headerPreview(markdownText) {
    var frontMatterRegex = /---\s*([\s\S]*?)\s*---/;
    var match = markdownText.match(frontMatterRegex);
    if (match) {
        var frontMatter = match[1];
        var lines = frontMatter.split('\n');
        var data = {};

        // Parse each line of the front matter
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.startsWith('---')) continue;
            var parts = line.split(':');
            var key = parts[0].trim();
            var value = parts.slice(1).join(':').trim();
            data[key] = value;
            data[key] = value.replace(/^"|"$/g, '');
        }
        var dateTimeParts = data.date.split(' ');
        var dateParts = dateTimeParts[0].split('-');
        var dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        if (isNaN(dateObject.getTime())) {
            dateObject = undefined;
        }
        // Format the date
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var formattedDate = dateObject ? monthNames[dateObject.getMonth()] + ' ' + dateObject.getDate() + ', ' + dateObject.getFullYear() : '';
                
        // Create the header HTML
        var headerHtml = `
        <header class="post-header">
            <h1 class="post-title p-name">${data.title}</h1>
            <p class="post-meta">
                <time class="dt-published">
                    ${formattedDate}
                </time>
        `+ ((data.author && formattedDate) ? ` • ` : ``) +`
                <span itemprop="author">
                    <span class="p-author h-card">${data.author}</span>
                </span>
            </p>
        </header>
        `;
        return headerHtml;
    }
}
function contentPreview(markdownText) {
    var content = markdownText.replace(/---[\s\S]*?---/, '');
    var contentHtml = `
    <div class="post-content e-content">
        ${marked.parse(content)}
    </div>
    `;
    return contentHtml;
}


function showEditor() {
    document.getElementById('input').style.display = 'block';
    document.getElementById('preview').style.display = 'none';
}
function showPreview() {
    document.getElementById('input').style.display = 'none';
    document.getElementById('preview').style.display = 'block';
}
function openFile(event) {
    var reader = new FileReader();
    reader.onload = function() {
        var text = reader.result;
        document.getElementById('markdown').value = text;
        updatePreview();
    };
    reader.readAsText(event.target.files[0]);
}

function saveFile(){
    var markdownText = document.getElementById('markdown').value;
    var dateMatch = markdownText.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
    var date = dateMatch ? dateMatch[1] + '-' : "";
    var title = markdownText.match(/title:\s*"([^"]*)"/)[1];
    title = title.replace(/\s+/g, '-');
    title = title.replace(/[\\/:*?"<>|]/g, '');
    var filename = date + title + '.md';

    var blob = new Blob([markdownText], {type: "text/plain;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
}

// function downloadPDF() {
//     var markdownText = document.getElementById('markdown').value;
//     var dateMatch = markdownText.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
//     var date = dateMatch ? dateMatch[1] + '-' : "";
//     var title = markdownText.match(/title:\s*"([^"]*)"/)[1];
//     title = title.replace(/\s+/g, '-');
//     title = title.replace(/[\\/:*?"<>|]/g, '');
//     var filename = date + title + '.pdf';

//     var pdf = new jsPDF();
//     var preview = document.getElementById('preview');

//     // Convert all images to screenshots
//     var images = preview.getElementsByTagName('img');
//     var promises = Array.from(images).map(function(img) {
//         return new Promise(function(resolve, reject) {
//             var image = new Image();
//             image.onload = function() {
//                 if (image) {
//                     html2canvas(image).then(function(canvas) {
//                         img.src = canvas.toDataURL('image/png');
//                         resolve();
//                     });
//                 };
//             }
//             image.onerror = reject;
//             image.src = img.src;
//         });
//     });

//     // Once all images have been converted to screenshots, convert the HTML to a PDF
//     Promise.all(promises).then(function() {
//         pdf.html(preview.innerHTML, {
//             callback: function (pdf) {
//                 pdf.save(filename);
//             }
//         });
//     });
// }

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey) {
        switch (event.key) {
            case 'o':
            case 'O':
                event.preventDefault();
                document.getElementById('file-input').click();
                break;
            case 's':
            case 'S':
                event.preventDefault();
                saveFile();
                break;
        }
    }
});
