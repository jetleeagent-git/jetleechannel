const rangeInput = document.querySelectorAll(".range-input input"),
  priceInput = document.querySelectorAll(".price-input input"),
  range = document.querySelector(".slider .progress");
let priceGap = 1000;

priceInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minPrice = parseInt(priceInput[0].value),
      maxPrice = parseInt(priceInput[1].value);

    if (maxPrice - minPrice >= priceGap && maxPrice <= rangeInput[1].max) {
      if (e.target.className === "input-min") {
        rangeInput[0].value = minPrice;
        range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
      } else {
        rangeInput[1].value = maxPrice;
        range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
      }
    }
  });
});

rangeInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minVal = parseInt(rangeInput[0].value),
      maxVal = parseInt(rangeInput[1].value);

    if (maxVal - minVal < priceGap) {
      if (e.target.className === "range-min") {
        rangeInput[0].value = maxVal - priceGap;
      } else {
        rangeInput[1].value = minVal + priceGap;
      }
    } else {
      priceInput[0].value = minVal;
      priceInput[1].value = maxVal;
      range.style.left = (minVal / rangeInput[0].max) * 100 + "%";
      range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  "use strict";

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Sticky header on scroll
   */
  const selectHeader = document.querySelector('#header');
  if (selectHeader) {
    document.addEventListener('scroll', () => {
      window.scrollY > 100 ? selectHeader.classList.add('sticked') : selectHeader.classList.remove('sticked');
    });
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = document.querySelectorAll('#navbar a');

  function navbarlinksActive() {
    navbarlinks.forEach(navbarlink => {

      if (!navbarlink.hash) return;

      let section = document.querySelector(navbarlink.hash);
      if (!section) return;

      let position = window.scrollY + 200;

      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navbarlinksActive);
  document.addEventListener('scroll', navbarlinksActive);

  /**
   * Mobile nav toggle
   */
  const mobileNavShow = document.querySelector('.mobile-nav-show');
  const mobileNavHide = document.querySelector('.mobile-nav-hide');

  document.querySelectorAll('.mobile-nav-toggle').forEach(el => {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      mobileNavToogle();
    })
  });

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavShow.classList.toggle('d-none');
    mobileNavHide.classList.toggle('d-none');
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navbar a').forEach(navbarlink => {

    if (!navbarlink.hash) return;

    let section = document.querySelector(navbarlink.hash);
    if (!section) return;

    navbarlink.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });
  $(function () {
    //Do not include! This prevents the form from submitting for DEMO purposes only!
    // $('form').submit(function(event) {
    //     event.preventDefault();
    //     return false;
    // })
  });


});

$('.toggle-fcn').click(function () {
  $('.fcn-wrapper').toggleClass('active');
  $(this).toggleClass('active');
})

// Tabs into dropdown

const $tabsToDropdown = $(".tabs-to-dropdown");

function generateDropdownMarkup(container) {
  const $navWrapper = container.find(".nav-wrapper");
  const $navPills = container.find(".tabs-solid");
  const firstTextLink = $navPills.find("li:first-child a").text();
  const $items = $navPills.find("li");
  const markup = `
    <div class="dropdown">
      <button class="btn dropdown-toggle btn-theme" type="button" id="blockDropdownToggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <i class="fa fa-check-circle-o mr-2"></i> <span>${firstTextLink}</span>
      </button>
      <div class="dropdown-menu" aria-labelledby="blockDropdownToggle"> 
        ${generateDropdownLinksMarkup($items)}
      </div>
    </div>
  `;
  $navWrapper.prepend(markup);
}

function generateDropdownLinksMarkup(items) {
  let markup = "";
  items.each(function () {
    const textLink = $(this).find("a").text();
    markup += `<a class="dropdown-item" href="#">${textLink}</a>`;
  });

  return markup;
}

function showDropdownHandler(e) {
  // works also
  //const $this = $(this);
  const $this = $(e.target);
  const $dropdownToggle = $this.find(".dropdown-toggle");
  const dropdownToggleText = $dropdownToggle.text().trim();
  const $dropdownMenuLinks = $this.find(".dropdown-menu a");
  const dNoneClass = "d-none";
  $dropdownMenuLinks.each(function () {
    const $this = $(this);
    if ($this.text() == dropdownToggleText) {
      $this.addClass(dNoneClass);
    } else {
      $this.removeClass(dNoneClass);
    }
  });
}

function clickHandler(e) {
  e.preventDefault();
  const $this = $(this);
  const index = $this.index();
  const text = $this.text();
  //<i class="fa fa-check-circle-o mr-2"></i> <span>${firstTextLink}</span>
  $this.closest(".dropdown").find(".dropdown-toggle").html(`<i class="fa fa-check-circle-o mr-2"></i> <span>${text}</span>`);
  $this
    .closest($tabsToDropdown)
    .find(`.tabs-solid li:eq(${index}) a`)
    .tab("show");
}

function shownTabsHandler(e) {
  // works also
  //const $this = $(this);
  const $this = $(e.target);
  const index = $this.parent().index();
  const $parent = $this.closest($tabsToDropdown);
  const $targetDropdownLink = $parent.find(".dropdown-menu a").eq(index);
  const targetDropdownLinkText = $targetDropdownLink.text();
  $parent.find(".dropdown-toggle").text(targetDropdownLinkText);
}

$tabsToDropdown.each(function () {
  const $this = $(this);
  const $pills = $this.find('a[data-toggle="pill"]');

  generateDropdownMarkup($this);

  const $dropdown = $this.find(".dropdown");
  const $dropdownLinks = $this.find(".dropdown-menu a");

  $dropdown.on("show.bs.dropdown", showDropdownHandler);
  $dropdownLinks.on("click", clickHandler);
  $pills.on("shown.bs.tab", shownTabsHandler);
});


/**
 * 检查 URL 是否包含特定参数并保存到 Cookie
 * @param {string[]} params - 需要检查的参数名称数组
 * @param {string} cookieName - 保存 URL 的 Cookie 名称
 */
function checkAndSaveUrlParams(params = ['gclid', 'fbclid', 'gad_source', 'gad_campaignid'], cookieName = 'full_url') {
  const url = window.location.href;

  // 检查 URL 是否包含任一参数
  const hasParam = params.some(param => url.includes(`${param}=`));

  if (hasParam) {
    setCookie(cookieName, url);
  }
}

checkAndSaveUrlParams();

// 设置会话 Cookie（浏览器关闭时过期）
function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}

// 获取会话 Cookie
function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (let i = 0; i < cookies.length; i++) {
    const parts = cookies[i].split('=');
    if (parts[0] === name) {
      return decodeURIComponent(parts[1]);
    }
  }
  return null;
}

// 删除会话 Cookie（通过设置为空字符串，会话结束后自动失效）
function deleteSessionCookie(name) {
  document.cookie = `${name}=; path=/`; // 无需设置过期时间，浏览器关闭后自动删除
}


//recaptcha callback
let currentRecaptchaEl = null;
$(document).on('mouseenter', '.g-recaptcha.regrecaptcha iframe', function () {
  currentRecaptchaEl = $(this).closest('.g-recaptcha.regrecaptcha');
});
function regrecaptcha() {
  if (currentRecaptchaEl && currentRecaptchaEl.length) {
    // 找到它紧邻的下一个兄弟 .recaptchares 并清空
    currentRecaptchaEl.next('.recaptchares').empty();
  }
  currentRecaptchaEl = null;
}

let $form;
// on submit form
$('.enquiryform').on('submit', function (e) {
  e.preventDefault();

  $form = $(this);

  var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;

  var name = $form.find('#client_name').val().trim();
  var number = $form.find('#client_number').val().trim();
  var email = $form.find('#client_email').val().trim();
  var message = $form.find('#client_message').val().trim();
  var agree = $form.find('#agree').is(':checked');
  var recaptchares = $form.find('#regrecaptchares');
  var otp = $form.find('input[name="otp"]');

  $form.find('#name_msg').text('');
  $form.find('#number_msg').text('');
  $form.find('#email_msg').text('');
  $form.find('#message_msg').text('');
  $form.find('#agree_msg').text('');
  recaptchares.html('');

  var error = false;

  if (name.length == 0) {
    error = true;
    $form.find('#name_msg').text(' (Please fill this input field)');
  }
  if (number.length == 0) {
    error = true;
    $form.find('#number_msg').text(' (Please fill this input field)');
  } else if (checkphonenumber(number)) {
    error = true;
    $form.find('#number_msg').text(' (Invalid input)');
  }
  if (email.length == 0) {
    error = true;
    $form.find('#email_msg').text(' (Please fill this input field)');
  } else if (!reg.test(email)) {
    error = true;
    $form.find('#email_msg').text(' (Please fill the correct email format)');
  }
  if (message.length == 0) {
    error = true;
    $form.find('#message_msg').text(' (Please fill this input field)');
  }

  if (!agree) {
    error = true;
    $form.find('#agree_msg').text(' (Please read and agreed with PropNex’s Privacy Policy)');
  }

  var index = $('.enquiryform').index($(this));
  if (recaptchares.length > 0 && (typeof (grecaptcha) === 'undefined' || grecaptcha.getResponse(index).length === 0)) {
    error = true;
    recaptchares.html("Please solve the recaptcha!").css('color', 'red');
  }

  if (!error && otp.length === 0) {
    $form[0].submit();
  }

  if (!error && otp.length > 0) {
    setNum(number);
    otp = '';
    $('#otpModal').modal('show');
  }
});

// $('#btnSubmit').click(function (e) {
//   var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;

//   var name = $('#client_name').val().trim();
//   var number = $('#client_number').val().trim();
//   var email = $('#client_email').val().trim();
//   var message = $('#client_message').val().trim();

//   $('#name_msg').text('');
//   $('#number_msg').text('');
//   $('#email_msg').text('');
//   $('#message_msg').text('');
//   $('#agree_msg').text('');

//   var agree = $('#agree').is(':checked');

//   var error = false;

//   if (name.length == 0) {
//     error = true;
//     $('#name_msg').text(' (Please fill this input field)');
//   }
//   if (number.length == 0) {
//     error = true;
//     $('#number_msg').text(' (Please fill this input field)');
//   } else if (checkphonenumber(number)) {
//     error = true;
//     $('#number_msg').text(' (Invalid input)');
//   }
//   if (email.length == 0) {
//     error = true;
//     $('#email_msg').text(' (Please fill this input field)');
//   } else if (!reg.test(email)) {
//     error = true;
//     $('#email_msg').text(' (Please fill the correct email format)');
//   }
//   if (message.length == 0) {
//     error = true;
//     $('#message_msg').text(' (Please fill this input field)');
//   }

//   if (!agree) {
//     error = true;
//     $('#agree_msg').text(' (Please read and agreed with PropNex’s Privacy Policy)');
//   }

//   // if ($('#regrecaptchares').length > 0 && (typeof (grecaptcha) === 'undefined' || grecaptcha.getResponse(0).length === 0)) {
//   //   error = true;
//   //   $('.recaptchares').eq(0).html("Please solve the recaptcha!").css('color', 'red');
//   // }

//   if (error) {
//     e.preventDefault();
//   }
// });

// $('.btnSubmit').click(function (e) {
//   const $form = $(this).closest('form');

//   var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;

//   var name = $form.find('#client_name').val().trim();
//   var number = $form.find('#client_number').val().trim();
//   var email = $form.find('#client_email').val().trim();
//   var message = $form.find('#client_message').val().trim();

//   $form.find('#name_msg').text('');
//   $form.find('#number_msg').text('');
//   $form.find('#email_msg').text('');
//   $form.find('#message_msg').text('');
//   $form.find('#agree_msg').text('');

//   var agree = $form.find('#agree').is(':checked');

//   var error = false;

//   if (name.length == 0) {
//     error = true;
//     $form.find('#name_msg').text(' (Please fill this input field)');
//   }
//   if (number.length == 0) {
//     error = true;
//     $form.find('#number_msg').text(' (Please fill this input field)');
//   } else if (checkphonenumber(number)) {
//     error = true;
//     $form.find('#number_msg').text(' (Invalid input)');
//   }
//   if (email.length == 0) {
//     error = true;
//     $form.find('#email_msg').text(' (Please fill this input field)');
//   } else if (!reg.test(email)) {
//     error = true;
//     $form.find('#email_msg').text(' (Please fill the correct email format)');
//   }
//   if (message.length == 0) {
//     error = true;
//     $form.find('#message_msg').text(' (Please fill this input field)');
//   }

//   if (!agree) {
//     error = true;
//     $form.find('#agree_msg').text(' (Please read and agreed with PropNex’s Privacy Policy)');
//   }

//   if (error) {
//     e.preventDefault();
//   }
// });

function checkphonenumber(number) {
  // 1. Wrong Length 659123456/812345678
  // 2. Invalid Prefix (Only 8 and 9 are valid starting digits)
  if (!(/^[3689]\d{7}$/).test(number)) {
    return true;
  }

  // 3. All Digits the Same 88888888/99999999/00000000
  // 4. Too Many Consecutive Same Digits 88888887/99999991
  // 9. Too Many Repeated Digits (More than 3 in a row) 89991111/88881234
  // 10. Simple “Obvious Fake” Patterns 80000001/90000007
  if ((/(\d)\1{3,}/).test(number)) {
    return true;
  }

  // 5. Sequential Ascending Patterns 12345678/23456789/34567890
  // 6. Sequential Descending Patterns 98765432/87654321/76543210
  let isAscending = true; // asc
  let isDescending = true; // desc
  for (let i = 2; i < 7; i++) {
    const current = parseInt(number[i], 10);
    const prev = parseInt(number[i - 1], 10);

    // 检查是否正序连续（后一位 = 前一位 + 1）
    if (current !== prev + 1) {
      isAscending = false;
    }

    // 检查是否倒序连续（后一位 = 前一位 - 1）
    if (current !== prev - 1) {
      isDescending = false;
    }

    // 若两种可能都不满足，提前退出循环
    if (!isAscending && !isDescending) {
      break;
    }
  }
  if (isAscending || isDescending) {
    return true;
  }

  // 7. Alternating Patterns 812121212/910101010/834343434
  if ((/^\d(\d)(\d)\1\2\1\2\1$/).test(number)) {
    return true;
  }

  // 8. Specific Known Fake Patterns 11223344/99887766
  let flag = true;
  for (let i = 0; i < number.length; i += 2) {
    const first = number[i];
    const second = number[i + 1];

    if (first !== second) {
      flag = false;
    }
  }
  if (flag) {
    return true;
  }

  return false;
}