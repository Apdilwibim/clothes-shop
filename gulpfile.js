const { src, dest, parallel, series, watch } = require('gulp');

const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const fileinclude = require('gulp-file-include');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const gulpif = require('gulp-if');
const newer = require('gulp-newer');
const merge = require("merge-stream");

let condition = true;
function conditionTrue() { condition = true }
function conditionFalse() { condition = false }

function serve() {
    browserSync.init({
        server: { baseDir: 'dist/' },
        notify: false,
    })
}

function html() {
    return src('src/index.html')
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(dest('dist'))
      .pipe(browserSync.stream());
}

function styles() {
    return src('src/styles/scss/main.scss')
    .pipe(sass())
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 versions'], grid: true
    }))
    .pipe(gulpif(condition, cleanCss(({ level: { 1: { specialComments: 0 }}}))))
    .pipe(dest('src/styles/'))
    .pipe(dest('dist/css/'))
    .pipe(browserSync.stream());
}

function scripts() {
    return src(['src/scripts/**.js'])
    .pipe(concat('scripts.js'))
    .pipe(gulpif(condition, uglify()))
    .pipe(dest('dist/scripts/'))
    .pipe(browserSync.stream());
}

function images() {
    return src('src/assets/images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(newer('dist/assets/images'))
    .pipe(imagemin([
        pngquant({quality: [0.8, 0.8]}),
        mozjpeg({quality: 95})
    ]))
    .pipe(dest('dist/assets/images'))
}

function copy() {
    return merge([
        src('src/styles/normalize.css').pipe(dest('dist/css/')),
        src('src/assets/fonts/**').pipe(dest('dist/assets/fonts'))
    ]);
}

function startwatch() {
    watch(['src/**/**.html'], html);
    watch(['src/styles/**/**.scss'], styles);
    watch(['src/scripts/**/**.js'], scripts);
    watch('src/assets/images/**/*', images);
    watch('src/**/**.html').on('change', browserSync.reload);
}

exports.serve = serve;
exports.scripts = scripts;
exports.styles = styles;
exports.html = html;
exports.images = images;
exports.copy = copy;

exports.conditionTrue = conditionTrue;
exports.conditionFalse = conditionFalse;

exports.dev = parallel(conditionFalse, copy, images, scripts, styles, html, serve, startwatch)

exports.default = parallel(conditionTrue, copy, images, scripts, styles, html, serve, startwatch)
