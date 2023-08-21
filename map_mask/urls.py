from django.contrib import admin
from django.urls import path, include
# Django管理者サイトの表示崩れ防止のため下記追記
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('masks/', include("masks.urls"))
]
# Django管理者サイトの表示崩れ防止のため最下行追記
urlpatterns += staticfiles_urlpatterns()