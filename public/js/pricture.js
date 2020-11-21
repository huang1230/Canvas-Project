if (!document.querySelectorAll) {
    document.querySelectorAll = function (selectors) {
        var style = document.createElement('style'),
            elements = [],
            element;
        document.documentElement.firstChild.appendChild(style);
        document._qsa = [];

        style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
        window.scrollBy(0, 0);
        style.parentNode.removeChild(style);

        while (document._qsa.length) {
            element = document._qsa.shift();
            element.style.removeAttribute('x-qsa');
            elements.push(element);
        }
        document._qsa = null;
        return elements;
    };
}

if (!document.querySelector) {
    document.querySelector = function (selectors) {
        var elements = document.querySelectorAll(selectors);
        return (elements.length) ? elements[0] : null;
    };
}

//将 rgb 转换为 16 进制值
String.prototype.colorHex = function () {
    // RGB颜色值的正则
    //如果开头是 例如 rgb() 或者 RGB() 的字符则判断通过。
    var reg = /^(rgb|RGB)/;
    var color = this;
    if (reg.test(color)) {
        var strHex = "#";
        // 把RGB的3个数值变成数组
        //重复全局检索，当字符串内容包含有 () 或 rgb 或 RGB 时通过，例如：rgb(0,0,0)
        //详解：
        // (? ：将后面的 \(|\)|rgb|RGB) 作为非捕获组【三个组】

        // 例如：'rgb(0,0,0)'.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",")
        /* rgb | () 两个返回true，由于是非捕获组，所以会跳过，
        之后将剩余的未通过的字符串 0,0,0 使用  split(',') 以 , 符号 隔开并合并成数组 ['0','0','0'] 返回 */

        var colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        // 转成16进制
        for (var i = 0; i < colorArr.length; i++) {
            var hex = Number(colorArr[i]).toString(16);
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        return strHex;
    } else {
        return String(color);
    }
}

//画图操作
function canvas_make() {
    ctx = canvas.getContext('2d')

    /*用于控制当前画布是否可以进行描边与绘制线条，
    如果当用户抬起鼠标以及鼠标离开画布范围，则代表用户不想画图了，这时候就需要停止当前画笔的绘制状态，
    只有当用户再次点击鼠标按下不动时，才能创建新的绘图路径的同时清除之前剩余的绘图路径，避免混淆。 bool = true 才能可以开始绘制线条。*/
    img_canvas = []
    /*用来存放画布截图的数组，ctx.getImageData() 方法会返回当前已渲染画布的所有内容，
    每当鼠标点击时，代表要创建新的线条，这时将之前画好并渲染的画布保存到数组中
    当想要撤回的时候，只要调用 ctx.putImageData() 并将 img_canvas 存储了画布截图的数组传入，并 length -1 （代表删除最后一步的画布操作）
    且 ctx.putImageData() 会将数组中存储的画布截图重新载入 canvas 画布中。以达到撤回的操作效果。
    */
    $(canvas).on('mouseover', function () {
        if (window.navigator.appVersion.indexOf('Trident') != -1) {
            $('#canvas_router').attr('style', {
                'width': canvas.width + 'px',
                'height': canvas.height + 'px',
                'cursor': 'pointer',
                'padding': '10px'
            })
        } else {
            $('#canvas_router').attr('style', {
                'width': canvas.width + 'px',
                'height': canvas.height + 'px',
                'cursor': 'pointer',
                'padding': '10px'
            })
        }
    })

    //鼠标按下
    $(canvas).on('mousedown', function (ev) {
        var e = ev || window.event
        ctx.lineCap = "round"; //设置线条的结束端点样式
        ctx.lineJion = "round"; //设置两条线相交时，所创建的拐角类型
        //当鼠标按下时，首先清除之前的绘制路径，并按照鼠标的Xy轴位置新建一个画笔移动点。
        bool = true
        ctx.beginPath()
        ctx.moveTo(e.clientX - (document.querySelector('#canvas_router').offsetLeft + 10), e.clientY - (document.querySelector('#canvas_router').offsetTop + 10))
        //注意，起始点和移动点所需要偏移的边距位置一定要一致，否则会发生错位。
        var pic = ctx.getImageData(0, 0, canvas.width, canvas.height)
        img_canvas.push(pic) //将当前画布存入数组中。
    })
    //鼠标移动
    $(canvas).on('mousemove', function (ev) {
        var e = ev || window.event
        if (bool) {
            ctx.lineTo(e.clientX - (document.querySelector('#canvas_router').offsetLeft + 10), e.clientY - (document.querySelector('#canvas_router').offsetTop + 10))
            ctx.stroke()
        }
    })

    //鼠标离开
    $(canvas).on('mouseout', function () {
        //当鼠标离开画布范围时，创建从当前点到起始点的绘图路径，闭合路径
        ctx.closePath()
        bool = false
    })

    //鼠标抬起
    $(canvas).on('mouseup', function () {
        //当鼠标离开抬起时，创建从当前点到起始点的绘图路径，闭合路径
        ctx.closePath()
        bool = false
    })
}

//复用函数，设置canvas父元素的样式
function canvas_style(canvas) {
    $('#main .canvas_box #canvas_router').append(canvas)
    $('#main').css({
        'width': canvas.width,
        'height': canvas.height
    })

    $('#main .canvas_box').css({
        'width': canvas.width,
        'height': canvas.height
    })

    $('#main .canvas_box #canvas_router').css({
        'width': canvas.width,
        'height': canvas.height,
        'padding': '10px',
        'box-shadow': '0px 0px 5px rgba(0,0,0,0.2)'
    })
}

//初始化模态框样式
$("#init_modal").modal({
    backdrop: false,
    keyboard: false,
    show: true //更改为false，不自动加载，在后期通过modal 函数动态传入参数来控制模态框的状态
})

var bool
var canvas
var ctx //全局变量，以便于全局使用
var img_canvas //存储图片截图的数组
var target = false
var Srcleft
var Srctop

//选择图片
function changeImg(ev) {
    var e = ev || window.event
    var img = new Image()
    img.src = URL.createObjectURL(document.querySelector('#img_link').files[0])
    canvas = document.createElement('canvas')
    canvas.innerText = "Your browser doesn't support canvas"
    //兼容性检测
    if (canvas.getContext) {
        ctx = canvas.getContext('2d'); // 返回一个对象，该对象提供了用在画布上绘图的方法和属性
    } else {
        document.write("你的浏览器不支持canvas，请升级你的浏览器");
    }

    var scale = 0.7 // 缩放倍数
    img.onload = function () {
        ctx.width = img.width * scale
        ctx.height = img.height * scale //渲染图像到 canvas 的画布宽高大小
        canvas.width = img.width * scale //canvas 标签元素的大小
        canvas.height = img.height * scale

        ctx.drawImage(img, 0, 0, ctx.width, ctx.height) //渲染图像到 canvas 中
        canvas_style(canvas) //加载 canvas
    }
    document.querySelector('#canvas-bg').value = canvas.style.background.colorHex()
    //初始化背景色控件，同时将 画布的 rgb背景色 转换为 color 控件可识别的 16进制值

    $('#init_modal').stop().fadeOut()
    canvas_make()
    paint_style() //画布画笔相关样式操作
    options_modal_toggle() //左侧工具栏面板样式切换
    canvas_narrow_amp() //滑动块控制画布等比例宽高
}

//导入本地图片文件，渲染canvas 
$('#img_link').on('change', function (ev) {
    changeImg(ev)
})




//初始化与检测画布宽高
$('#canvas-width').on('keyup', function () {
    if ($('#canvas-width').val() >= document.body.clientWidth) {
        $('#tip').stop().fadeIn()
        $('#tip .alert span').text('画布宽度过大!!!')
        $('#create_canvas_yes').attr('disabled', 'disabled')
        $('.close_tip').on('click', function () {
            $('#tip').stop().fadeOut()
        })
    } else {
        $('#create_canvas_yes').removeAttr('disabled')
    }
})

//初始化与检测画布宽高
$('#canvas-height').on('keyup', function () {
    if ($('#canvas-height').val() >= document.body.clientWidth * 1.5) {
        $('#tip').stop().fadeIn()
        $('#tip .alert span').text('画布高度过大!!!')
        $('#create_canvas_yes').attr('disabled', 'disabled')
        $('.close_tip').on('click', function () {
            $('#tip').stop().fadeOut()
        })
    } else {
        $('#create_canvas_yes').removeAttr('disabled')
    }
})

function init_canvas() {
    $('#clip_box').stop().fadeOut() //裁剪启用控件隐藏。只对图像进行裁剪操作
    //兼容性检测
   
    canvas = document.createElement('canvas')
    if (canvas.getContext) {
        ctx = canvas.getContext('2d'); // 返回一个对象，该对象提供了用在画布上绘图的方法和属性
    } else {
        document.write("你的浏览器不支持canvas，请升级你的浏览器");
    }
    canvas.style.background = $('#canvas-bg-color').val()
    canvas.innerText = "Your browser doesn't support canvas"
    if ($('#canvas-width').val() == 0 && $('#canvas-height').val() == 0) { //如果没有输入宽高，则默认 700 * 700 大小的画布
        document.querySelector('#canvas-width').value = 700
        document.querySelector('#canvas-height').value = 700
    }

    canvas.width = $('#canvas-width').val()
    canvas.height = $('#canvas-height').val()
    document.querySelector('#canvas-bg').value = canvas.style.background.colorHex()
    //初始化背景色控件，同时将 画布的 rgb背景色 转换为 color 控件可识别的 16进制值

    canvas_style(canvas) //加载 canvas
    canvas_make() // 开始制图
    paint_style() //画布画笔相关样式操作
    options_modal_toggle() //左侧工具栏面板样式切换
    canvas_narrow_amp() //滑动块控制画布等比例宽高
}

//自定义创建画布
$('#create_canvas_yes').on('click', function (){
    init_canvas()
})

//画出圆形
$('#The-article').on('click', function (ev) {
    var e = ev || window.event
    target = true //如果圆形功能开启，则进入代码段，执行画圆形的功能。
    $('.controls').removeClass('active')
    $('#The-article').addClass('active')

    //鼠标按下
    canvas.onmousedown = function () {
        console.log('鼠标按下，X：', e.clientX, 'Y:', e.clientY)
        bool = true
        ctx.beginPath()
        ctx.moveTo(e.clientX - (document.querySelector('#canvas_router').offsetLeft + 10), e.clientY - (document.querySelector('#canvas_router').offsetTop + 10))
        Srcleft = e.clientX - (document.querySelector('#canvas_router').offsetLeft + 10)
        Srctop = e.clientY - (document.querySelector('#canvas_router').offsetTop + 10)
        //注意，起始点和移动点所需要偏移的边距位置一定要一致，否则会发生错位。
        var pic = ctx.getImageData(0, 0, canvas.width, canvas.height)
        img_canvas.push(pic) //将当前画布存入数组中。
    }

    /**
     * 执行过程。当 '#The-article' 元素控件点击时，target 为 true，代表开启了画圆形图功能，此时会取消画线条的功能而转为画圆形图，
     * 之后为 canvas 画布绑定 鼠标移动事件（mousemove）。
     * 在鼠标移动事件（mousemove）当中 ，首先进行兼容性处理，为避免在IE 8及以下的低版本浏览器中也能进行事件绑定操作。
     * 之后，判断canvas 是否被创建而存在 width 宽 height 高度，如果没有则代表没有创建canvas 不能进行画圆形图功能，否则可以进行。
     * 之后，通过 bool 变量【mousedown 中 bool 会设置为 true】判断鼠标是否按下，如果鼠标已按下代表即将进行画图功能，否则将不进行、
     * 之后，通过 img_canvas 变量【mousedown 中 img_canvas 是一个图像数组，专门用于存储每次画好的线条图像】判断 canvas 画布中是否有遗留图像存在，
     * 如果有，代表此画布是可以创建圆形在画布上，否则不可以。
     * 之后，通过 for 循环语句遍历每个  img_canvas 数组，根据 img_canvas  数组的遍历次数来重复决定圆形的绘制方向，避免偏差。
     * 最终，通过 ctx.beginPath() 清空之前绘制的所有虚拟路径（虚拟路径相当于草稿），再使用 ctx.arc() 创建对应参数的圆形在画布中渲染完毕。
     */
    if (target) {
        console.log('圆形功能启用')

        //鼠标移动
        canvas.onmousemove = function (e) {
            //兼容性处理
            var ev // event 事件对象
            var acticle //圆形半径

            if (window.e) { //兼容Chrome 、IE9+ 浏览器。
                ev = window.e
            } else {
                ev = window.event
            }

            if (canvas.width && canvas.height) { //存在canvas
                console.log("鼠标按下", 'X：', Srcleft, 'Y:', Srctop)
                if (bool) { //鼠标已经按下
                    console.log('鼠标移动，X：', ev.clientX, 'Y:', ev.clientY)
                    if (img_canvas) { //如果存储有图像，则可以创建圆形在画布上。

                        for (var i = 0; i < img_canvas.length; i++) {
                            console.log('圆形数组：', img_canvas)
                            if (ev.clientX <= Srcleft) { //左边
                                acticle = Math.abs(((ev.clientX - Srcleft) - 10) / 2)
                            } else { //右边
                                acticle = (ev.clientX - Srcleft) / 2
                            }

                            ctx.beginPath() //清空原始路径
                            ctx.arc(Srcleft, Srctop, acticle / 4, 0 * Math.PI, 2 * Math.PI) //制作出相应参数的圆形
                            console.log("圆半径：", acticle / 4, '圆直径：', (acticle / 4) * 2)
                        }
                    } else {
                        return false
                    }
                } else { //否
                    return false
                }
            } else {
                console.log('先创建canvas')
                return false
            }
        }
    } else {
        console.log('没有启动圆形功能')
        canvas_make() // 开始制图
    }

    //鼠标抬起
    canvas.onmouseup = function () {
        console.log("鼠标松开")
        ctx.stroke()
        //当鼠标离开抬起时，创建从当前点到起始点的绘图路径，闭合路径
        ctx.closePath()
        bool = false
    }
})

$('#cancel-active').on('click', function () { //取消圆形功能
    target = false
    $('#The-article').removeClass('active')
    canvas_make() // 开始制图
})

//保存图片操作
$('#canvas-save').on('click', function () {
    var link = document.createElement('a')
    var imgURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        width: canvas.width,
        height: canvas.height
    }) //转化为 base64 编码

    var strDataURI = imgURL.substr(22, imgURL.length) //截取后面的数据串，不要前面的 data/image .. 的类型声明。

    //转化为 blob 二进制数据
    var blob = dataURLtoBlob(imgURL)

    //获取到下载路径。
    var data_url = URL.createObjectURL(blob)
    link.download = "pictrue-grid-" + Math.floor(Math.random() * 1000) + ".png"; // a 链接启动下载功能。
    link.href = data_url; // 设置 a 链接下载的地址
    link.click() // a 链接点击功能出发，开始下载。

    //将图片数据转化为 blob 数据的具体操作
    function dataURLtoBlob(data_url) {
        var arr = data_url.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], {
            type: mime
        })
    }
})

//调整亮度操作
$('#canvas_brightness').on('input propertychange', function () {
    $('.canvas_light').text($('#canvas_brightness').val())
    if ($('#canvas_brightness').val() == 1) { //默认背景色
        canvas.style.background = document.querySelector('#canvas-bg').value.colorHex()
    } else if ($('#canvas_brightness').val() > 1) { //增亮
        $(canvas).css('opacity', $('#canvas_brightness').val() / 10)
    }
})

//修改尺寸操作
$('#modify_C_WH_NO').on('click', function () {
    canvas.width = $('#canvas-width').val()
    canvas.height = $('#canvas-height').val()
    canvas_style(canvas)
})

//确认修改尺寸
$('#modify_C_WH_YES').on('click', function () {
    if ($('#modify_C_width').val() >= 0) {
        canvas.width = $('#modify_C_width').val()
    } else {
        canvas.width = $('#canvas-width').val()
    }
    if ($('#modify_C_height').val() >= 0) {
        canvas.height = $('#modify_C_height').val()
    } else {
        canvas.height = $('#canvas-height').val()
    }

    canvas_style(canvas)
})

//画布相关样式操作
function paint_style() {
    //线条颜色
    $('#canvas_paint_color').on('change', function () {
        ctx.strokeStyle = $('#canvas_paint_color').val()
    })
    //线条粗细
    $('#canvas_paint_line-width').on('input propertychange', function () {
        ctx.lineWidth = $('#canvas_paint_line-width').val()
        $('.line_width').text($('#canvas_paint_line-width').val())
    })

    //橡皮檫操作
    $('#Rubber_width').on('input propertychange', function () {
        ctx.lineWidth = $('#Rubber_width').val()
        $('.Rubber_width').text($('#Rubber_width').val())
    })

    //背景色调整
    $('#canvas-bg').on('change', function () {
        canvas.style.background = $('#canvas-bg').val()
    })

    //撤回操作
    $('#canvas_back').on('click', function () {
        if (img_canvas.length > 0) { //代表之前画过
            ctx.putImageData(img_canvas.pop(), 0, 0)
        }
        /*
            撤回的原理：
            canvas 会在每次鼠标按下的时候（要创建新图像），通过 getImageData() 方法存入一个等比例大小的图像到数组中，
            当点击撤回按钮时，将此图像截图数组传入 putImageData() 方法中，此方法会将数组中存储的图像截图重新载入到 canvas 中。
            就好比 VM ware 的快照。
        */
    })

    //重做操作
    $('#canvas_clean').on('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height) //新建一个等比例大小的画布覆盖之前的画布
    })
}

//左侧工具栏面板样式切换    
function options_modal_toggle() {
    //基础调整面板
    $('#basis').on('click', function () {
        $('.model.active').removeClass('active')
        $('.basis_options').addClass('active')
        $('.options .btn.active').removeClass('active')
        $('#basis').addClass('active')
        if (document.querySelector('#canvas_router').childNodes[2]) {
            document.querySelector('#canvas_router').removeChild(document.querySelector('#canvas_router').childNodes[2])

        }
        has_text = false
        has_clip = false
    })

    var has_text = false //控制一次点击只能创建一个文本输入框
    var has_clip = false

    //文字编辑框//插入文字
    $('#font').on('click', function () {
        $('.model.active').removeClass('active')
        $('.font_options').addClass('active')
        $('.font_options_close').on('click', function () {
            $('.font_options').stop().fadeOut()
        })
        $('.options .btn.active').removeClass('active')
        $('#font').addClass('active')

        if (has_text == false) {
            //创建文本输入框
            var div = document.createElement('div')
            div.id = 'canvas_text'
            div.draggable = true //代表此文本输入框可被用户拖拽
            div.innerText = '输入文字'
            $('#canvas_router').append(div)
            has_text = true
            //文本框拖拽

            div.onmousedown = function (e) {
                var ev = e || event;
                var left = ev.clientX - div.offsetLeft,
                    top = ev.clientY - div.offsetTop;
                document.onmousemove = function (e) {
                    var ev = e || event
                    var leftW = ev.clientX - left
                    var topH = ev.clientY - top
                    left = leftW
                    top = topH
                    $(canvas).attr('data-left', left)
                    $(canvas).attr('data-top', top)
                    //左边不能超出
                    if (leftW <= ($('#main').css('padding-left').split('px')[0] * 2) - 10) {
                        leftW = ($('#main').css('padding-left').split('px')[0] * 2) - 10
                    }
                    //上边不能超出
                    if (topH < ($('#main').css('padding-top').split('px')[0] - 15)) {
                        topH = ($('#main').css('padding-top').split('px')[0] - 15)
                    }

                    //右边不能超出
                    if (leftW >= (canvas.width - parseInt($('#main').css('padding-right').split('px')[0]))) {
                        leftW = (canvas.width - $('#main').css('padding-right').split('px')[0])
                    }
                    //下边不能超出
                    if (topH > (canvas.height - 15)) {
                        topH = (canvas.height - 15)
                    }
                    div.style.left = leftW + 'px'
                    div.style.top = topH + 'px'
                }
                document.onmouseup = function (e) {
                    document.onmousemove = null
                    document.onmouseup = null
                }
                return false
            }

            //文字输入
            $('#canvas_text_input').on('keyup', function () {
                $('#canvas_text').text($('#canvas_text_input').val())
            })

            //文字颜色
            $('#canvas_text_color').on('change', function () {
                $('#canvas_text').css("color", $('#canvas_text_color').val())
            })

            //文字大小
            $('#canvas_text_width').on('input propertychange', function () {
                $('.canvas_text_fontsize').text($('#canvas_text_width').val() + 'px')
                $('#canvas_text').css('font-size', $('#canvas_text_width').val() + 'px')
            })

            //文本框旋转
            $('#canvas_text_rotate').on('input propertychange', function () {
                $('.rotate_text').text($('#canvas_text_rotate').val() + 'deg')
                $('#canvas_text').css('transform', 'rotate(' + $('#canvas_text_rotate').val() + 'deg)')
            })

            //确认渲染文字
            $('#canvas_text_YES').on('click', function () {
                ctx.fillStyle = $('#canvas_text_color').val() //字体颜色

                ctx.font = '600' + $('#canvas_text_width').val() + 'px sans-serif' //字体样式

                ctx.textAlign = 'center' //对齐方式

                ctx.translate($('.rotate_text').width / 2, $('.rotate_text').height / 2) //规定旋转中心点，以元素的水平垂直中心点为准。
                ctx.rotate($('#canvas_text_rotate').val() * Math.PI / 180) // 旋转字体

                if (!$(canvas).attr('data-left')) { //用户没有拖拽文本框，则默认以 居中的形式渲染文本位置。
                    ctx.fillText($('#canvas_text_input').val(), canvas.width / 2, canvas.height / 2)
                }
                ctx.fillText($('#canvas_text_input').val(), $(canvas).attr('data-left'), $(canvas).attr('data-top'))
                //执行渲染文本内容以及位置
                try {
                    //渲染一次删除一次文本框
                    document.querySelector('#canvas_router').removeChild(document.querySelector('#canvas_router').childNodes[2])
                } catch (error) {
                    console.error("删除文本元素失败，status：未知...")
                }

            })

            //取消操作
            $('#canvas_text_NO').on('click', function () {
                document.querySelector('#canvas_text_input').value = '请输入文字'
                $('#canvas_text').text('输入文字')
                document.querySelector('#canvas_text_color').value = '#000000'
                document.querySelector('#canvas_text_width').value = '14'
                $('.canvas_text_fontsize').text('13px')
                document.querySelector('#canvas_text_rotate').value = '0'
                $('.rotate_text').text('0deg')

                $('#canvas_text').text('输入文字')
                $('#canvas_text').css({
                    'color': '#000000',
                    'font-size': '14px',
                    'transform': 'rotate(0deg)'
                })
            })
        }

    })

    //画笔编辑框
    $('#paint').on('click', function () {
        $('.model.active').removeClass('active')
        $('.paint_options').addClass('active')
        $('.options .btn.active').removeClass('active')
        $('#paint').addClass('active')
        if (document.querySelector('#canvas_router').childNodes[2]) {
            document.querySelector('#canvas_router').removeChild(document.querySelector('#canvas_router').childNodes[2])
        }

        has_text = false
        has_clip = false
    })

    //橡皮檫
    $('#Rubber').on('click', function () {
        $('.model.active').removeClass('active')
        $('.Rubber_options').addClass('active')
        $('.options .btn.active').removeClass('active')
        $('#Rubber').addClass('active')

        ctx.strokeStyle = canvas.style.background
        if (document.querySelector('#canvas_router').childNodes[2]) {
            document.querySelector('#canvas_router').removeChild(document.querySelector('#canvas_router').childNodes[2])
        }

        has_text = false
        has_clip = false
    })

    var lefts // 控制输入图像的 X 轴

    //裁剪面板
    $('#canvas_clip').on('click', function () {
        $('.model.active').removeClass('active')
        $('.clip_options').addClass('active')
        $('.options .btn.active').removeClass('active')
        $('#canvas_clip').addClass('active')

        if (has_clip == false) {
            var clip_div = document.createElement('div')
            clip_div.id = 'canvas_tailoring'
            $('#canvas_router').append(clip_div)
            has_clip = true

            var clip_width = $(clip_div).css('width').split('px')[0]
            var clip_height = $(clip_div).css('height').split('px')[0]

            //初始化控件数值
            document.querySelector('#clip_C_width').value = clip_width
            document.querySelector('#clip_C_height').value = clip_height

            clip_div.onmousedown = function (e) {

                var ev = e || event;
                var left = ev.clientX - clip_div.offsetLeft,
                    top = ev.clientY - clip_div.offsetTop

                document.onmousemove = function (e) {
                    var ev = e || event
                    var leftW = ev.clientX - left
                    var topH = ev.clientY - top
                    left = leftW
                    top = topH
                    lefts = leftW

                    $(canvas).attr('data-left', left)
                    $(canvas).attr('data-top', top)
                    //左边不能超出
                    if (leftW <= (parseInt($('#canvas_tailoring').css('width').split('px')[0]) - $('#main').css('padding-left').split('px')[0] * 2) - 15) {
                        leftW = (parseInt($('#canvas_tailoring').css('width').split('px')[0]) - $('#main').css('padding-left').split('px')[0] * 2) - 15
                    }
                    //上边不能超出
                    if (topH < ($('#main').css('padding-top').split('px')[0] * 3) - 10) {
                        topH = ($('#main').css('padding-top').split('px')[0] * 3) - 10
                    }
                    //右边不能超出
                    if (leftW >= (canvas.width - parseInt($('#main').css('padding-right').split('px')[0]) * 2) - 20) {
                        leftW = (canvas.width - parseInt($('#main').css('padding-right').split('px')[0]) * 2) - 20
                    }
                    //下边不能超出
                    if (topH > (canvas.height - parseInt($('#main').css('padding-right').split('px')[0]) * 2) - 15) {
                        topH = (canvas.height - parseInt($('#main').css('padding-right').split('px')[0]) * 2) - 15
                    }
                    clip_div.style.left = leftW + 'px'
                    clip_div.style.top = topH + 'px'
                }
                document.onmouseup = function (e) {
                    document.onmousemove = null
                    document.onmouseup = null
                }
                return false
            }

            $('#clip_C_width').on('keyup', function () {
                clip_div.style.width = $('#clip_C_width').val() + 'px'
            })

            $('#clip_C_height').on('keyup', function () {
                clip_div.style.height = $('#clip_C_height').val() + 'px'
            })

            //裁剪取消操作
            $('#clip_C_WH_NO').on('click', function () {
                clip_div.style.width = '35%'
                clip_div.style.height = '35%'
                ctx.restore()
            })

            //确认裁剪
            $('#clip_C_WH_YES').on('click', function () {
                $('#canvas_tailoring').stop().fadeOut(100)
                ctx.save() //裁剪之前先保存路径状态以便于恢复

                //获取当前画布的图像,返回一个 Imagedata 数据
                var image = new Image();
                image.src = URL.createObjectURL(document.querySelector('#img_link').files[0])
                image.onload = function () {
                    var width = parseInt($(clip_div).css('width').split('px')[0])
                    var height = parseInt($(clip_div).css('height').split('px')[0])
                    ctx.beginPath()
                    canvas.width = width * 2
                    canvas.height = height * 2
                    canvas_style(canvas)

                    ctx.rect(0, 0, width * 2, height * 2)
                    ctx.clip()
                    if (!lefts) {
                        lefts = width
                    } else {
                        lefts = lefts - 50
                    }
                    ctx.drawImage(image, lefts, height + 15, width * 1.6, height * 1.6, 0, 0, width * 2, height * 2)
                }
            })
        }

    })

}

//滑动块控制画布的宽高大小等比例缩放
function canvas_narrow_amp() {
    var type = true //节流阀，控制滑动块在鼠标移动时，按照鼠标按下抬起时才可以生效。

    $('#snrPollInterval').on('mousedown', function () {
        type = true
        var PollX
        $('#snrPollInterval').on('mousemove', function (e) {
            if (type) {
                PollX = e.clientX //100 毫秒之前的移动位置
                setTimeout(function () { //100毫秒后的移动位置
                    if (document.querySelector('#snrPollInterval').value >= 110) {
                        return false
                    } else {
                        ctx.scale(2, 2)
                        ctx.stroke()
                        canvas_make()
                    }
                }, 100);
            }
        })
    })

    //propertychange 实时跟踪事件
    $('#snrPollInterval').on('input propertychange', function (e) {
        $('.plus_options .show_narrows').stop().fadeIn(100).text($('#snrPollInterval').val() + '%')
    })

    //隐藏图标
    $('#snrPollInterval').on('mouseup', function () {
        $('.plus_options .show_narrows').stop().fadeOut(500)
        type = false
    })

    //单点扩大操作
    $('#canvas_amplification').on('click', function () {
        if (document.querySelector('#snrPollInterval').value >= 110) {
            return false
        } else {
            $('.plus_options .show_narrows').stop().fadeIn(100).text($('#snrPollInterval').val() + '%')
            document.querySelector('#snrPollInterval').value = parseInt(document.querySelector('#snrPollInterval').value) + 10
            ctx.scale(2, 2)
            ctx.stroke()
            type = false
        }
    })
}

//设置滑动条滑动时的样式改变
function RangeStyle() {
    //滑动时的样式
    $.fn.RangeSlider = function (cfg) {
        this.sliderCfg = {
            min: cfg && !isNaN(parseFloat(cfg.min)) ? Number(cfg.min) : null,
            max: cfg && !isNaN(parseFloat(cfg.max)) ? Number(cfg.max) : null,
            step: cfg && Number(cfg.step) ? cfg.step : 5,
            callback: cfg && cfg.callback ? cfg.callback : null
        }

        var $input = $(this)
        var min = this.sliderCfg.min
        var max = this.sliderCfg.max
        var step = this.sliderCfg.step
        var callback = this.sliderCfg.callback

        $input.attr('min', min)
            .attr('max', max)
            .attr('step', step);

        $input.bind("input", function (e) {
            $input.attr('value', this.value)
            $input.css('background', 'linear-gradient(to right, #059CFA, #ebeff4 ' + this.value + '%, #ebeff4)')

            if ($.isFunction(callback)) {
                callback(this);
            }
        })
    }
    //适配所有滑动控件
    $('#snrPollInterval').RangeSlider({
        min: 10,
        max: 100,
        step: 10,
        callback: ''
    })
}

window.onload = function () {
    //滑动条样式
    RangeStyle()
    if (window.navigator.appVersion.indexOf('Trident') != -1) {
		$('#canvas-bg-color').val('#ffffff') //画布背景色
		$('#canvas_paint_color').val('#000000') //画布背景色
		$('#modify_C_width').val($('#canvas-width').val()) //画布背景色
		$('#modify_C_height').val($('#canvas-height').val()) //画布背景色
        $('#init_modal').removeClass('fade')
        $('#init_modal').stop().fadeIn()
        $('#img_link').on('propertychange input', function (ev) {
            changeImg(ev)
        })
        $('#create_canvas_yes').on('click', function () {
            init_canvas()
            $('#init_modal').addClass('fade')
            $('#init_modal').stop().fadeOut()
        })
    } else {
		//初始化 color 控件选色
		document.querySelector('#canvas-bg-color').value = '#ffffff' //画笔色
		document.querySelector('#canvas_paint_color').value = '#000000' //画笔色
		//初始化控件宽高数值
		document.querySelector('#modify_C_width').value = $('#canvas-width').val()
		document.querySelector('#modify_C_height').value = $('#canvas-height').val()
	}
}