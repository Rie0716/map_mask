/*global $*/

$('.show').modaal({
  start_open: true,
  is_locked: true,
});

// チェックボックスと利用するボタンの制御
$('#checkBtn').on('change', function() {
  if ($(this).is(':checked')) {
    $('#submitBtn').prop('disabled', false);
  }
  else {
    $('#submitBtn').prop('disabled', true);
  }
});

// 利用するボタンが押されたらポップアップ閉じる
$('#submitBtn').click(() => {
  $('.show').modaal('close');
})