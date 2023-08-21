from django import forms
from .models import Mask

class MaskCreateForm(forms.ModelForm):
    class Meta:
        model = Mask
        exclude = ("update_at","difference",)