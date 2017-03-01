const gulp = require('gulp');
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
            .pipe(gulp.dest('dist/style'));
    })
    /*********************js************************/
gulp.task('html', function() {
    return gulp.src('app/*.html') // 指明源文件路径、并进行文件匹配
        .pipe(gulp.dest('dist')); // 输出路径
});
//同一批相关操作
gulp.task('images', function() {
    return gulp.src('app/images/*.*') // 指明源文件路径、并进行文件匹配
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }], //不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })))
        .pipe(gulp.dest('dist/images')); // 输出路径
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
    })
    //clean
gulp.task('clean', function() {
    return gulp.src('dist/*') // 指明源文件路径、并进行文件匹配
        .pipe(clean()); // 输出路径
});
// 监视文件变化，自动执行任务
gulp.task('watch', function() {
    gulp.watch('app/*.html', ['html']);
    gulp.watch('app/style/*.less', ['convertCSS']);
    gulp.watch('app/script/*.js', ['convertJS']);
    gulp.watch('app/images/*.*', ['images']);
})
gulp.task('start', ['convertJS', 'convertCSS', 'html', 'images']);
gulp.task('default', ['start', 'watch']);