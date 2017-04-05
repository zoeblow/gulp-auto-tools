const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const browserSync = require('browser-sync');
const yargs = require('yargs').argv;
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cssnano = require('gulp-cssnano');
const less = require('gulp-less');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const postcss = require('gulp-postcss');
const px2rem = require('postcss-px2rem');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const clean = require('gulp-clean');
const tap = require('gulp-tap');
const rev = require('gulp-rev');
const revCollector = require("gulp-rev-collector");

const option = {base: 'app'};
const dist = __dirname + '/dist';
/*********************css***********************/
gulp.task('convertCSS', function() {
    return gulp.src('app/style/*.less')
    .pipe(less())
    .pipe(postcss([px2rem({ remUnit: 50 })])) //配合适配手机端方法基数为50，/*no*/这个放在不转换css行后面
    .pipe(autoprefixer({
        browsers: ['last 2 versions', 'Android >= 4.0'],
        cascade: false, //是否美化属性值 默认：true
        remove: true //是否去掉不必要的前缀 默认：true
    }))
    .pipe(concat('index.css'))
    .pipe(gulp.dest('dist/style'))
    .pipe(cssnano())
    .pipe(rename(function(path) {
        path.basename += '.min';
    }))
    .pipe(gulp.dest('dist/style'))
    .pipe(browserSync.reload({
        stream: true
    }));
})
    /*********************js************************/
gulp.task('html', function() {
    return gulp.src('app/*.html') // 指明源文件路径、并进行文件匹配
    .pipe(gulp.dest('dist')) // 输出路径
    .pipe(browserSync.reload({
        stream: true
    }));
});
gulp.task('htmlTpl', function() {
    return gulp.src('app/tpl/*.html') // 指明源文件路径、并进行文件匹配
    .pipe(gulp.dest('dist/tpl')) // 输出路径
    .pipe(browserSync.reload({
        stream: true
    }));
});
//同一批相关操作
gulp.task('images', function() {
    return gulp.src('app/images/*.*') // 指明源文件路径、并进行文件匹配
    .pipe(cache(imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }], //不要移除svg的viewbox属性
        use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
    })))
    .pipe(gulp.dest('dist/images')) // 输出路径
    .pipe(browserSync.reload({
        stream: true
    }));
});
// 编译并压缩js
gulp.task('convertJS', function() {
    return gulp.src('app/script/*.js')
    .pipe(concat('index.js'))
    .pipe(gulp.dest('dist/script'))
    .pipe(uglify())
    .pipe(rename(function(path) {
        path.basename += '.min';
    }))
    .pipe(gulp.dest('dist/script'))
    .pipe(browserSync.reload({
        stream: true
    }));
})
//clean
gulp.task('clean', function() {
    return gulp.src('dist/*') // 指明源文件路径、并进行文件匹配
        .pipe(clean()); // 输出路径
});

gulp.task('buildhtml', function (){
    gulp.src('app/index.html', option)
    .pipe(tap(function (file){
        var dir = path.dirname(file.path);
        var contents = file.contents.toString();
        contents = contents.replace(/<link\s+rel="import"\s+href="(.*)">/gi, function (match, $1){
            var filename = path.join(dir, $1);
            var id = path.basename(filename, '.html');
            var content = fs.readFileSync(filename, 'utf-8');
            //console.log(id,content)
            return '<script type="text/html" id="tpl_'+ id +'">\n'+ content +'\n</script>';
        });
        file.contents = new Buffer(contents);
    }))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({
        stream: true
    }));
});


gulp.task('build',function(){
    return gulp.src(['./dist/style/index.min.css', './dist/script/index.min.js'], {base: 'dist'})
        .pipe(rev())  //生成版本号文件
        .pipe(gulp.dest('./dist/'))  // 将生成的文件 放入文件目录
        .pipe(rev.manifest()) // 执行转换操作
        .pipe(gulp.dest('./dist/rev')) ; //写入 rev.json 文件
})

gulp.task('rev', function () {
    return gulp.src(['./dist/rev/rev-manifest.json', './dist/*.html'])
        .pipe( revCollector({
            replaceReved: true,
        }))
        .pipe( gulp.dest('./dist/') )
        .pipe(browserSync.reload({
            stream: true
        }));
});

// 配置服务器
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: './dist/'
        },
        port: 8000
    });
});

// 监视文件变化，自动执行任务
gulp.task('watch', function() {
    gulp.watch('app/**/*.html', ['html','buildhtml','rev']);
    gulp.watch('app/style/**/*.less', ['convertCSS']);
    gulp.watch('app/script/*.js', ['convertJS']);
    gulp.watch('app/images/**/*.*', ['images']);
    gulp.watch('app/tpl/**/*.html', ['htmlTpl','buildhtml','rev']);
    gulp.watch(['dist/style/index.min.css','dist/script/index.min.js'], ['build','rev']);
})

gulp.task('start', ['convertJS', 'convertCSS', 'html', 'images','htmlTpl','buildhtml','build','rev','serve']);
gulp.task('default', ['start', 'watch']);