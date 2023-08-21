/*global $*/
/*global google*/
/*global map*/

function initMap() {
  let map;
  const area = document.getElementById("map");
  const center = {
    lat: 37.448651119732254,
    lng: 138.85105042657983,
  };

  map = new google.maps.Map(area, {
    center,
    zoom: 13,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.LEFT_TOP,
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER,
    },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    },
  });

  // 検索ボックスに入力された内容を取得
  const input = document.getElementById("pac-input");
  // 上記情報を元に、地図上で場所を検索
  const searchBox = new google.maps.places.SearchBox(input);

  // 地図上に検索ボックスを表示するための位置を設定
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  // 地図の表示範囲が変更されるたびに検索ボックスの範囲を更新するためのイベントリスナーを追加
  map.addListener("bounds_changed", () => {
    // 検索ボックスの検索範囲を現在の地図の表示範囲に合わせて更新するための処理
    searchBox.setBounds(map.getBounds());
  });

  // 検索ボックスの検索結果が変更されたときに呼び出されるイベントリスナーを追加
  searchBox.addListener("places_changed", () => {
    // 検索ボックスの現在の検索結果を取得
    const places = searchBox.getPlaces();
    // もし検索結果がない（検索結果が空の）場合は処理を中断（終了）
    if (places.length == 0) {
      return;
    }

    // 地図上の領域を表す新しいboundsオブジェクトを作成（LatLngBoundsクラスは、地図上の領域を南西の位置と北東の位置を示す）
    const bounds = new google.maps.LatLngBounds();
    // 検索結果の場所（places配列）に対して繰り返し処理
    places.forEach((place) => {
      // 場所のジオメトリ情報または位置情報が存在しない場合、
      if (!place.geometry || !place.geometry.location) {
        // 処理を中断しコンソールにメッセージを出力
        console.log("位置情報を取得できませんでした");
        return;
      }

      // 場所のジオメトリ情報にビューポートが存在する場合としない場合で処理を分岐
      if (place.geometry.viewport) {
        // boundsオブジェクトにビューポート（地図上の表示範囲を示す）を結合
        bounds.union(place.geometry.viewport);
      }
      else {
        // ビューポートが存在しない場合は位置情報を拡張
        bounds.extend(place.geometry.location);
      }
    });
    // boundsオブジェクトの範囲に合わせて地図上に表示される範囲が検索結果に基づいて自動的に調整される
    map.fitBounds(bounds);
  });
  
  // マップ上のマーカー（marker）、情報ウィンドウ（infoWindow）を格納する空のリストを用意
  let marker = [];
  let infoWindow = [];

  // markerクリック時のmarkerEvent関数を定義
  const markerEvent = (i) => {
    marker[i].addListener('click', () => {
      //infoWindowをすべて閉じる
      markerClose();
      //クリックされたmarkerのinfoWindowを表示
      infoWindow[i].open(map, marker[i]);
    });
  }
  //各markerに対応するinfoWindowをすべて閉じるmarkerClose関数を定義
  const markerClose = () => {
    for (const i in marker) {
      infoWindow[i].close();
    }
  }
  
  // DB情報の取得：jQueryのajaxメソッドを使い、json形式でGETリクエスト
  $(function() {
    $.ajax({
      type: "GET",
      url: "/masks/data/",
      dataType: "json",
      success: function(data) {
        // setMarker関数にDBから取得したdata.masksデータを呼び出す
        setMarker(data.masks);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert('Error : ' + errorThrown);
      }
    });
  });

  // DBから取得したmarkerDataを使うsetMarker関数を定義
  const setMarker = (markerData) => {
    // markerDataの内容をコンソール出力で確認
    console.log(markerData);

    //markerのアイコン画像（icon）変数を定義する
    let icon;
    // markerData内の各データをforループで処理
    for (let i = 0; i < markerData.length; i++) {
      // markerの表示位置をDBの緯度経度情報から定める
      let latNum = parseFloat(markerData[i]['lat']);
      let lngNum = parseFloat(markerData[i]['lng']);
      let markerLatLng = new google.maps.LatLng({
        lat: latNum,
        lng: lngNum
      });

      //DBのstatusカラムの値ごとにiconを条件分岐させる
      if (markerData[i]['status'] === '在庫あり') {
        icon = new google.maps.MarkerImage('/static/images/map/blue.png');
      }
      else if (markerData[i]['status'] === '在庫少なめ') {
        icon = new google.maps.MarkerImage('/static/images/map/yellow.png');
      }
      else if (markerData[i]['status'] === '在庫無し') {
        icon = new google.maps.MarkerImage('/static/images/map/red.png');
      }
      else {
        icon = new google.maps.MarkerImage('/static/images/map/gray.png');
      }

      // 各markerの表示設定
      marker[i] = new google.maps.Marker({
        position: markerLatLng, // markerを立てる位置を指定
        map: map, // markerを立てる地図を指定
        icon: icon // iconを指定
      });

      // infoWindow表示の内容
      infoWindow[i] = new google.maps.InfoWindow({
        content: `<div class="info">
        <div class="store">${markerData[i]['store']}</div><br>
        <div class="status">在庫状況：${markerData[i]['status']}</div><br>
        <div class="update">最終投稿日時：${markerData[i]['update_at']}</div><br>
        <div class="diffrence">${markerData[i]['difference']}日以上前のデータです</div><br>
        <a href="/masks/update/${markerData[i]['id']}/">在庫状況を投稿する</a><br>
        </div>`,
      });
      // 84行目で定義したmarkerEvent関数を実行
      markerEvent(i);
    }
  }
}