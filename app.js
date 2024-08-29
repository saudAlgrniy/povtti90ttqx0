window.onload = function() {
    let term = document.querySelector('#query');
    term.focus();
    const params = new URLSearchParams(window.location.search);
    if (params.has('query')) {
        term.value = params.get('query');
        find(params.get('query'));
    }

    // إنشاء زر CC
    let ccButton = document.createElement('button');
    ccButton.id = 'ccButton';
    ccButton.textContent = 'CC';
    ccButton.onclick = goToSubsource;

    // إضافة الأنماط CSS لزر CC
    let style = document.createElement('style');
    style.textContent = `
        #ccButton {
            background-color: white; /* خلفية بيضاء */
            color: black; /* نص باللون الأسود */
            border: 2px solid black; /* إطار أسود */
            padding: 10px 20px; /* حواف مناسبة */
            font-size: 16px; /* حجم الخط */
            cursor: pointer; /* تغيير المؤشر عند المرور فوق الزر */
            border-radius: 5px; /* زوايا مستديرة */
            margin: 10px; /* هامش لتفادي التداخل */
            width: 35px; /* عرض الزر */
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);

    // إضافة الزر إلى الصفحة
    let body = document.querySelector('body');
    body.appendChild(ccButton);
};

async function find(search) {
    let result = document.getElementById("result");
    let result_div = document.getElementById("result_div");
    let loading = document.querySelector('#loading');
    let query_name = document.querySelector('#query_name');
    let query = document.querySelector('#query');

    loading.style.display = 'block';
    query.disabled = true;

    try {
        let api1 = fetch('https://news-api-six-navy.vercel.app/api/torrent/nyaasi/' + search);
        let api2 = fetch('https://news-api-six-navy.vercel.app/api/torrent/piratebay/' + search);

        let [apidata1, apidata2] = await Promise.all([api1, api2]);
        let actualdata1 = await apidata1.json();
        let actualdata2 = await apidata2.json();

        let actualdata = [...actualdata1, ...actualdata2];

        result.classList.add('fade-out');
        setTimeout(() => {
            result_div.innerHTML = "";
            if (actualdata.length === 0) {
                result.style.display = 'none';
            } else {
                result.style.display = 'block';
                query_name.innerHTML = `
                    <span>
                        <i class="color-change">[ ${search} ]</i> نـتـائـج الـبـحـث لــ
                    </span>`;
                for (let i = 0; i < actualdata.length; i++) {
                    let htmlData = `
                    <div class='card mb-3'>
                        <h5 class="name">${actualdata[i].Name.substring(0, 80)}</h5>
                        <h6 class="ls">Leechers : <span class="leechers">${actualdata[i].Leechers}</span> | Seeders : <span class="seeders">${actualdata[i].Seeders}</span></h6>
                        <div class="btns">
                            <span title='نسخ المغناطيس إلى الحافظة' onclick="copy('${actualdata[i].Magnet}')"> <i class="fas fa-copy icon"></i> </span>
                            <span title='فتح رابط المغناطيس' onclick="openMagnet('${actualdata[i].Magnet}')"> <i class="fas fa-external-link-alt icon"></i> </span>
                            <span title='مشاركة رابط المغناطيس' onclick="share('${actualdata[i].Magnet}')"> <i class="fas fa-share icon"></i> </span>
                            <span title='عرض الفيديو' onclick="stream('${actualdata[i].Magnet}')"> <i class="fas fa-play icon"></i> Stream</span>
                        </div>
                    </div>
                    `;
                    result_div.innerHTML += htmlData;
                }
            }

            result.classList.remove('fade-out');
            result.classList.add('fade-in');
            loading.style.display = 'none';
            query.disabled = false;
        }, 300);
    } catch (e) {
        swal("عذراً!", "عذراً، لم نتمكن من العثور على التورنت المتعلق باستعلامك. يرجى المحاولة باستخدام استعلام آخر.", "error");
        loading.style.display = "none";
        query.value = "";
        query.placeholder = "يرجى المحاولة بكلمة مفتاحية أخرى";
        query.disabled = false;
    }
}

function goToSubsource() {
    let query = document.querySelector('#query').value.trim();
    if (query) {
        // تحويل النص إلى صيغة مناسبة للـ URL
        let formattedQuery = query
            .toLowerCase()
            .replace(/\s+/g, '-') // استبدال المسافات بشرطات
            .replace(/[^a-z0-9-]/g, ''); // إزالة أي أحرف غير مناسبة

        window.location.href = `https://subsource.net/subtitles/${formattedQuery}`;
    } else {
        swal("تنبيه", "يرجى إدخال استعلام البحث أولاً.", "warning");
    }
}

function copy(magnet) {
    navigator.clipboard.writeText(magnet).then(() => {
        swal("نجاح", "تم نسخ رابط المغناطيس إلى الحافظة!", "success");
    }).catch((error) => {
        swal("حدث خطأ", "حدث خطأ أثناء نسخ رابط المغناطيس، يرجى نسخه يدوياً", "error");
    });
}

function openMagnet(magnet) {
    window.open(magnet);
}

function share(magnet) {
    const webtorBaseUrl = 'https://webtor.io/';
    const hashMatch = magnet.match(/btih:([0-9A-Fa-f]{40,})/);
    const hash = hashMatch ? hashMatch[1] : '';

    const fullUrl = webtorBaseUrl + hash;

    if (hash) {
        window.location.href = fullUrl;
    } else {
        swal("حدث خطأ", "لم نتمكن من استخراج الـ hash من رابط المغناطيس.", "error");
    }
}

function stream(magnet) {
    const hashMatch = magnet.match(/btih:([0-9A-Fa-f]{40,})/);
    const hash = hashMatch ? hashMatch[1] : '';

    if (hash) {
        const playerUrl = `player.html?hash=${hash}`;
        window.location.href = playerUrl;
    } else {
        swal("حدث خطأ", "لم نتمكن من استخراج الـ hash من رابط المغناطيس.", "error");
    }
}

try {
    // أضف تأثير التلاشي
    result.classList.remove('fade-out');
    result.classList.add('fade-in');

    // انتظر حتى ينتهي تأثير التلاشي (تعديل الوقت وفقًا للتأثير الخاص بك)
    setTimeout(() => {
        loading.style.display = 'none';
        query.disabled = false;
    }, 300); // الانتظار حتى انتهاء تأثير التلاشي
} catch (e) {
    console.error('حدث خطأ:', e);
}