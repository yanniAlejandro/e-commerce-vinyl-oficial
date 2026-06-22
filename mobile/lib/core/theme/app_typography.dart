import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

abstract final class AppTypography {
  static TextStyle displayTitle(BuildContext context, {double? size}) {
    return GoogleFonts.syne(
      fontSize: size ?? 28,
      fontWeight: FontWeight.w700,
      letterSpacing: -0.02 * (size ?? 28),
      color: AppColors.text,
      height: 1.05,
    ).copyWith(textBaseline: TextBaseline.alphabetic);
  }

  static TextStyle serifTitle(BuildContext context, {double size = 40}) {
    return GoogleFonts.instrumentSerif(
      fontSize: size,
      fontStyle: FontStyle.italic,
      fontWeight: FontWeight.w400,
      color: AppColors.text,
      height: 1.1,
    );
  }

  static TextStyle label({Color? color}) {
    return GoogleFonts.ibmPlexMono(
      fontSize: 11,
      letterSpacing: 1.8,
      color: color ?? AppColors.textMuted,
    );
  }

  static TextStyle mono({double size = 12, Color? color, double letterSpacing = 1.2}) {
    return GoogleFonts.ibmPlexMono(
      fontSize: size,
      letterSpacing: letterSpacing,
      color: color ?? AppColors.text,
    );
  }

  static TextStyle body({double size = 15, Color? color}) {
    return GoogleFonts.inter(
      fontSize: size,
      color: color ?? AppColors.text,
      height: 1.55,
    );
  }

  static TextStyle logo() {
    return GoogleFonts.syne(
      fontSize: 22,
      fontWeight: FontWeight.w800,
      letterSpacing: -0.04 * 22,
      color: AppColors.text,
    );
  }
}
