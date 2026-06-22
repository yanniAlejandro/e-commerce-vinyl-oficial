import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';
import 'app_typography.dart';

class AppTheme {
  static ThemeData get dark {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bg,
      colorScheme: const ColorScheme.dark(
        surface: AppColors.surface,
        onSurface: AppColors.text,
        primary: AppColors.accent,
        onPrimary: AppColors.bg,
        secondary: AppColors.textMuted,
        error: AppColors.danger,
      ),
      dividerColor: AppColors.border,
      splashColor: AppColors.border,
      highlightColor: AppColors.border,
    );

    return base.copyWith(
      textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(
        bodyColor: AppColors.text,
        displayColor: AppColors.text,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.headerBg,
        foregroundColor: AppColors.text,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: AppTypography.mono(size: 13, letterSpacing: 1.6),
        iconTheme: const IconThemeData(color: AppColors.text),
        shape: const Border(
          bottom: BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.bg,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        labelStyle: AppTypography.label(),
        hintStyle: AppTypography.body(color: AppColors.textMuted),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: const BorderSide(color: AppColors.borderStrong),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: BorderSide(color: AppColors.danger.withValues(alpha: 0.5)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          shadowColor: Colors.transparent,
          minimumSize: const Size.fromHeight(48),
          backgroundColor: AppColors.accent,
          foregroundColor: AppColors.bg,
          disabledBackgroundColor: AppColors.accent.withValues(alpha: 0.35),
          disabledForegroundColor: AppColors.bg.withValues(alpha: 0.6),
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
          textStyle: AppTypography.mono(size: 11.5, color: AppColors.bg, letterSpacing: 1.8),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          elevation: 0,
          minimumSize: const Size.fromHeight(48),
          foregroundColor: AppColors.text,
          side: const BorderSide(color: AppColors.borderStrong),
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
          textStyle: AppTypography.mono(size: 11.5, letterSpacing: 1.8),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.textMuted,
          textStyle: AppTypography.mono(size: 11, color: AppColors.textMuted),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.bg,
        selectedColor: AppColors.accent,
        labelStyle: AppTypography.mono(size: 10, letterSpacing: 1.2),
        secondaryLabelStyle: AppTypography.mono(size: 10, color: AppColors.bg),
        side: const BorderSide(color: AppColors.borderStrong),
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      ),
      dropdownMenuTheme: DropdownMenuThemeData(
        textStyle: AppTypography.body(),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.bg,
          border: OutlineInputBorder(borderRadius: BorderRadius.zero),
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.text,
        circularTrackColor: AppColors.border,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.surface,
        contentTextStyle: AppTypography.mono(size: 12),
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      ),
    );
  }
}
