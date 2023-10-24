# Generated by Django 4.2.5 on 2023-10-10 07:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("sendemail", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Trip",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("number", models.CharField(max_length=50)),
                ("start", models.CharField(max_length=100)),
                ("end", models.CharField(max_length=100)),
                ("hours", models.DecimalField(decimal_places=2, max_digits=5)),
                ("link", models.URLField()),
            ],
        ),
    ]