from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.http import Http404
from django.shortcuts import render,get_object_or_404
from .models import Mask
from .forms import MaskCreateForm
from datetime import datetime
from django.http import JsonResponse
import MySQLdb

# トップページ
def top(request):
    return render(request, "masks/top.html", {})
    
# 利用規約ページ
def rule(request):
    return render(request, "masks/rule.html", {})

# 該当ID店舗の在庫状況更新ページ
def update(request, id):
    mask = Mask.objects.get(id=id)
    if request.method == "POST":
        mask.status = request.POST.get("status")
        mask.save()
        return redirect("/masks/")
    
    return render(request, "masks/update.html", {
        "title" : f"{mask.store} のマスク在庫状況を投稿する",
        "mask" : mask,
    })

# データベース一覧表示ページ（管理者用）
def list(request):
    masks = Mask.objects.all()
    # 現時点の日時取得
    day = datetime.now()
    today = day.date()
    
    for mask in masks:
        # 最終投稿日時の取得
        last_post = mask.update_at.date()
        # 現時点の日時－最終投稿日時＝日数差
        dif = today - last_post
        # dif.daysをdifferenceカラムの値に代入
        mask.difference = dif.days

    return render(request, "masks/list.html",{
        "title" : "マスク在庫シェアマップデータ一覧",
        "masks" : masks,
    })

# Modelformを利用した新規店舗登録ページ（管理者用）
def create(request):
    form = MaskCreateForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        form.save()
        return redirect("/masks/list")
        
    return render(request, "masks/create.html", {
        "title" : "在庫状況の新規登録",
        "form" : form,
    })

# 該当ID店舗の在庫情報の詳細ページ（管理者用）
def detail(request, id):
    mask = Mask.objects.get(id=id)
    # 現時点の日時取得
    day = datetime.now()
    today = day.date()
    # 最終投稿日時の取得
    last_post = mask.update_at.date()
    # 現時点の日時－最終投稿日時＝日数差
    dif = today - last_post
    # 変数difの日付型のdif.daysをdifferenceカラムの値に代入
    mask.difference = dif.days
    
    return render(request, "masks/detail.html", {
        "title" : f"薬局ID:{id} {mask.store}の在庫状況【詳細】",
        "mask" : mask,
    })
    
# 該当ID店舗の在庫情報の削除（管理者用）
def delete(request, id):
    if request.method == "POST":
        mask = Mask.objects.get(id=id)
        mask.delete()
    return redirect("/masks/list/")

# マップ上の情報ウィンドウに表示するDBデータをjsonコードで渡す（管理者用）
def data(request):
    # maskテーブル全要素取得
    masks = Mask.objects.all()
    # 現時点の日時取得
    day = datetime.now()
    today = day.date()
    # 空のリストを用意
    masks_list = []
    
    #for文を使ってレコードごとの最終投稿日からの日数差および最終投稿日のフォーマットを取得
    for mask in masks:
        # 最終投稿日時の取得
        last_post = mask.update_at.date()
        # 現時点の日時－最終投稿日時＝日数差
        dif = today - last_post
        # dif.daysをdifferenceカラムの値に代入
        mask.difference = dif.days
        
        # 日付時刻を指定されたフォーマットに変換したformatted_datetimeを作成
        formatted_datetime = mask.update_at.strftime('%Y年%m月%d日%H時%M分%S秒')
        
        # 上記変更を適用したデータを辞書型のmask_dataに格納
        mask_data = {
            'id': mask.id,
            'store': mask.store,
            'status': mask.status,
            'update_at': formatted_datetime,
            'difference': mask.difference,
            'lat': mask.lat,
            'lng': mask.lng,
        }
        # mask_dataをmasks_listの中に格納
        masks_list.append(mask_data)
    
    # for文内で変更された値のMaskモデルデータを辞書型に変換 
    datas = {'masks': masks_list}
    # JSON形式で返す
    return JsonResponse(datas)