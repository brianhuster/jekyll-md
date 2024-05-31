window.onload = function() {
    loadPage('home');
    if (localStorage.getItem('jekyll_md')) {
        document.getElementById("markdown").value = localStorage.getItem('jekyll_md');
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

function loadPage(pageId) {
    var template = document.getElementById(pageId);
    if (template) {
        var content = document.getElementById('content');
    
        // Clear the current content
        content.innerHTML = '';
    
        // Clone the template content and append it to the content container
        content.appendChild(document.importNode(template.content, true));
    }
    if (pageId == 'home') {
        updatePreview();
    }
}

function updatePreview() {
    var markdownText = document.getElementById("markdown").value;
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
        if (data.date) {
            var dateTimeParts = data.date.split(' ');
            var dateParts = dateTimeParts[0].split('-');
            var dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            if (isNaN(dateObject.getTime())) {
                dateObject = undefined;
            }
            // Format the date
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        }
        var formattedDate = dateObject ? monthNames[dateObject.getMonth()] + ' ' + dateObject.getDate() + ', ' + dateObject.getFullYear() : '';
        var title= data.title ? data.title : ''; 
        var author= data.author ? data.author : '';       
        // Create the header HTML
        var headerHtml = `
        <header class="post-header">
            <h1 class="post-title p-name">${title}</h1>
            <p class="post-meta">
                <time class="dt-published">
                    ${formattedDate}
                </time>
        `+ ((data.author && formattedDate) ? ` • ` : ``) +`
                <span itemprop="author">
                    <span class="p-author h-card">${author}</span>
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

async function readFile(filePath){
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        return text;
    } catch (error) {
        console.log('There was a problem with the fetch operation: ' + error.message);
    }
}

function showEditor() {
    document.getElementById('input').style.display = 'block';
document.getElementById('preview').style.display = 'none';
    document.getElementById('edit-btn').style.display = 'none';
    document.getElementById('preview-btn').style.display = 'inline-block';
}
function showPreview() {
    document.getElementById('input').style.display = 'none';
document.getElementById('preview').style.display = 'block';
    document.getElementById('edit-btn').style.display = 'inline-block';
    document.getElementById('preview-btn').style.display = 'none';
}
function openFile(event) {
    var reader = new FileReader();
    reader.onload = function() {
        var text = reader.result;
        document.getElementById("markdown").value = text;
        updatePreview();
    };
    reader.readAsText(event.target.files[0]);
}

function fileName() {
    var markdownText = document.getElementById("markdown").value;
    var dateMatch = markdownText.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
    var date = dateMatch ? dateMatch[1] + '-' : "";
    var title = markdownText.match(/title:\s*"([^"]*)"/)[1];
    title = title.replace(/\s+/g, '-');
    title = title.replace(/[\\/:*?"<>|]/g, '');
    var filename = date + title;
    return filename;
}

function saveMd(filename){
    var markdownText = document.getElementById("markdown").value;
    var blob = new Blob([markdownText], {type: "text/plain;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
}

async function saveDoc(filename) {
    var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title>";
    var postHtml = "</body></html>";
    var css=await readFile("css/preview.css");
    css = css.replace(/article/g, 'body');
    css='<style> '+css+' </style></head><body>';
    var html = document.getElementById('preview').innerHTML;
    html += postHtml;
    var html = preHtml + css + html;
    var blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });

    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);


    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {

        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.click();
    }

    document.body.removeChild(downloadLink);
}

async function saveDocx(filename) {
    var css = await readFile("css/preview.css");
    css = css.replace(/article/g, 'body');
    var html = document.getElementById('preview').innerHTML;
    var docx = htmlDocx.asBlob(html);
    var url = URL.createObjectURL(docx);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showDialog() {
    document.getElementById('dialog').style.display = 'block';
    document.getElementById('filename').value = fileName();
}

function hideDialog() {
    document.getElementById('dialog').style.display = 'none';
}

function saveFile() {
    var filename = document.getElementById('filename').value;
    var filetype = document.getElementById('filetype').value;
    switch (filetype) {
        case 'md':
            saveMd(filename+'.md');
            break;
        case 'doc':
            saveDoc(filename+'.doc');
            break;
        case 'docx':
            saveDocx(filename+'.docx');
            break;
    }
    hideDialog();
}
