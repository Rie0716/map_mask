from django.urls import path
from django.http import HttpResponse
from django.shortcuts import render
from . import views

urlpatterns = [
    path("", views.top),
    path("rule/", views.rule),
    path("update/<int:id>/", views.update),
    # 以下管理者用
    path("list/", views.list),
    path("create/", views.create),
    path("detail/<int:id>/", views.detail),
    path("delete/<int:id>/", views.delete),
    path("data/", views.data),
    ]