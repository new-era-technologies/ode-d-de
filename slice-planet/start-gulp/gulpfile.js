const { src, dest, lastRun, watch, series, parallel } = require('gulp'),
  browserSync = require('browser-sync').create(),
  del = require('gulp-clean'),
  imagemin = require('gulp-imagemin'),
  cache = require('gulp-cache'),
  rigger = require('gulp-rigger'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  purge = require('gulp-css-purge'),
  minifyCss = require('gulp-clean-css'),
  autoprefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify-es').default,
  babel = require('gulp-babel'),
  jsValidate = require('gulp-jsvalidate');

sass.compiler = require('node-sass');


function clean() {
  return src('app/build/**/*', { read: false })
  // .pipe(del());
}

function html() {
  return src('app/*.html')
    .pipe(rigger())
    .pipe(dest('app/build'))
    .pipe(browserSync.stream());
}

function css() {
  return src('app/scss/**/*.scss')
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(sass().on('error', sass.logError))
    .pipe(purge())
    .pipe(concat('main.css'))
    .pipe(minifyCss())
    .pipe(dest('app/build/css'))
    .pipe(browserSync.stream());
}

function javascript() {
  return src('app/js/**/*.js')
    .pipe(jsValidate())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(dest('app/build/js'))
    .pipe(browserSync.stream());
}

function images() {
	return src('app/assets/img/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}]
		})))
		.pipe(dest('app/build/assets/img')); // Выгружаем на продакшен
}

// function sprites() {
//   var sprite = gulp.src('app/assets/img/icons/*.png').pipe(spritesmith({
//     imgName: '../../img/sprite.png',
//     cssName: '_sprite.scss',
//     cssFormat: 'scss',
//     algoritm: 'binary-tree',
//     padding: 5
//   }));
//   sprite.img.pipe(rename('sprite.png')).pipe(gulp.dest('app/assets/img/'));
//   sprite.css.pipe(gulp.dest('app/scss/utils/'));
// }

function assets() {
  return src('app/build/assets/**/*.*', { since: lastRun(assets) })
    .pipe(dest('app/build/assets'))
    .pipe(browserSync.stream());
}


exports.default = function () {
  // browserSync.init({
  //   server: { baseDir: "./build" }
  // });
  watch(['app/html/*.html', 'app/scss/**/*.scss', 'app/js/**/*.js'], series(clean, images, assets, parallel(html, css, javascript))).on('change', browserSync.reload);
};